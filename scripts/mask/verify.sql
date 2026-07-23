-- =====================================================================
-- マスク漏れ検査（クラウド投入前チェック）
--
-- 実行方式（1 件でも違反があれば非ゼロ終了して投入を止める）:
--   docker exec -i rinshouji-db \
--     psql -v ON_ERROR_STOP=1 -U rinshouji -d rinshouji_masked < scripts/mask/verify.sql
--
-- 前提: mask.sql 適用 → migrate:parties 再実行の「後」に走らせること。
--   （parties(import) はマスク済み household_members から再生成された状態で検査する）
--
-- 違反があれば件数入りで RAISE EXCEPTION して全体を失敗させる。
-- 違反ゼロなら各テーブルの件数を RAISE NOTICE で出力する（投入前の目視突合用）。
-- =====================================================================

DO $$
DECLARE
  -- mask.sql の姓プールと同一（この配列に無い family_name はマスク漏れ）。
  v_surnames text[] := ARRAY[
    '佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤',
    '吉田','山田','佐々木','山口','松本','井上','木村','林','斎藤','清水',
    '山崎','森','池田','橋本','阿部','石川','山下','中島','石井','小川',
    '前田','岡田','長谷川','藤田','後藤','近藤','村上','遠藤','青木','坂本',
    '斉藤','福田','太田','西村','藤井','岡本','松田','中川','中野','原田',
    '小野','田村','竹内','金子','和田','中山','石田','上田','森田','原'];
  n         bigint;
  problems  text := '';
BEGIN
  -- 1. import_records の原文（raw_data）が空でない行
  SELECT count(*) INTO n FROM import_records WHERE raw_data <> '{}'::jsonb;
  IF n > 0 THEN problems := problems || format(E'  - import_records.raw_data 未マスク: %s 件\n', n); END IF;

  -- 2. note 系（自由記述）が非 NULL
  SELECT count(*) INTO n FROM households WHERE note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - households.note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM household_members WHERE note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - household_members.note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM deceased_persons WHERE note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - deceased_persons.note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM deceased_persons WHERE kaimyo_note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - deceased_persons.kaimyo_note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM deceased_persons WHERE notice_note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - deceased_persons.notice_note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM cemetery_plots WHERE note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - cemetery_plots.note 非NULL: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM columbarium_units WHERE note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - columbarium_units.note 非NULL: %s 件\n', n); END IF;

  -- 3. households の住所2 は一律 NULL のはず
  SELECT count(*) INTO n FROM households WHERE address_2 IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - households.address_2 非NULL: %s 件\n', n); END IF;

  -- 4. 電話（固定・携帯）が想定パターン以外の非 NULL
  SELECT count(*) INTO n FROM households WHERE phone IS NOT NULL AND phone NOT LIKE '0568-99-%';
  IF n > 0 THEN problems := problems || format(E'  - households.phone がマスクパターン外: %s 件\n', n); END IF;

  SELECT count(*) INTO n FROM households WHERE mobile_phone IS NOT NULL AND mobile_phone NOT LIKE '090-0000-%';
  IF n > 0 THEN problems := problems || format(E'  - households.mobile_phone がマスクパターン外: %s 件\n', n); END IF;

  -- 5. 郵便番号が想定パターン以外の非 NULL
  SELECT count(*) INTO n FROM households WHERE postal_code IS NOT NULL AND postal_code NOT LIKE '486-99%';
  IF n > 0 THEN problems := problems || format(E'  - households.postal_code がマスクパターン外: %s 件\n', n); END IF;

  -- 6. family_name が姓プールに無い非 NULL
  SELECT count(*) INTO n FROM households WHERE family_name IS NOT NULL AND NOT (family_name = ANY(v_surnames));
  IF n > 0 THEN problems := problems || format(E'  - households.family_name が姓プール外: %s 件\n', n); END IF;

  -- 7. user_accounts は全削除済み
  SELECT count(*) INTO n FROM user_accounts;
  IF n > 0 THEN problems := problems || format(E'  - user_accounts 残存: %s 件\n', n); END IF;

  -- 8. parties(origin='manual') は全削除済み
  SELECT count(*) INTO n FROM parties WHERE origin = 'manual';
  IF n > 0 THEN problems := problems || format(E'  - parties(origin=manual) 残存: %s 件\n', n); END IF;

  -- 9. household_members の姓部分（全角スペース区切りの先頭）が姓プールに無い行
  --    （mask.sql は「姓　名」形式で完全合成するため、プール外＝マスク漏れ）
  SELECT count(*) INTO n FROM household_members
   WHERE NOT (split_part(name, '　', 1) = ANY(v_surnames));
  IF n > 0 THEN problems := problems || format(E'  - household_members.name が姓プール外: %s 件\n', n); END IF;

  -- 10. parties(origin='import') の display_name がマスク済み household_members.name と
  --     一致しない行。migrate:parties の再実行を忘れると実名が残るため、ここで検知する。
  SELECT count(*) INTO n FROM parties p
   WHERE p.origin = 'import'
     AND NOT EXISTS (SELECT 1 FROM household_members m WHERE m.name = p.display_name);
  IF n > 0 THEN
    problems := problems || format(
      E'  - parties(import).display_name が household_members と不一致: %s 件（mask.sql 適用後に migrate:parties を再実行しましたか?）\n', n);
  END IF;

  -- 11. parties の連絡先・住所・自由記述は全行 NULL のはず
  --     （manual は削除済み、import の再生成は display_name/kana しか埋めない）
  SELECT count(*) INTO n FROM parties
   WHERE email IS NOT NULL OR phone IS NOT NULL OR postal_code IS NOT NULL
      OR address_1 IS NOT NULL OR address_2 IS NOT NULL OR note IS NOT NULL;
  IF n > 0 THEN problems := problems || format(E'  - parties の連絡先/住所/note 非NULL: %s 件\n', n); END IF;

  IF problems <> '' THEN
    RAISE EXCEPTION E'マスク検査に失敗しました。以下を確認してください:\n%', problems;
  END IF;

  RAISE NOTICE 'マスク検査 OK（違反 0 件）。';
END $$;

-- ---------------------------------------------------------------------
-- 件数サマリ（投入前の目視突合用）
-- ---------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '--- 件数サマリ ---';
  FOR r IN
    SELECT 'import_records'        AS t, count(*) AS c FROM import_records
    UNION ALL SELECT 'districts',            count(*) FROM districts
    UNION ALL SELECT 'households',           count(*) FROM households
    UNION ALL SELECT 'household_members',    count(*) FROM household_members
    UNION ALL SELECT 'deceased_persons',     count(*) FROM deceased_persons
    UNION ALL SELECT 'cemetery_plots',       count(*) FROM cemetery_plots
    UNION ALL SELECT 'columbarium_units',    count(*) FROM columbarium_units
    UNION ALL SELECT 'parties',              count(*) FROM parties
    UNION ALL SELECT 'party_roles',          count(*) FROM party_roles
    UNION ALL SELECT 'household_memberships',count(*) FROM household_memberships
    UNION ALL SELECT 'role_types',           count(*) FROM role_types
    UNION ALL SELECT 'user_accounts',        count(*) FROM user_accounts
    ORDER BY t
  LOOP
    RAISE NOTICE '  % = %', rpad(r.t, 22), r.c;
  END LOOP;
END $$;
