-- =====================================================================
-- 個人情報マスク（クラウド Neon 投入用）
--
-- 目的:
--   ローカルの使い捨て DB `rinshouji_masked` に対し、通常の migrate 実行後に
--   本ファイルを適用して氏名・住所・電話・戒名・原文（import_records）などの
--   個人情報を架空値へ置換する。マスク後に `migrate:parties` を再実行すると
--   household_members（マスク済み）から parties(origin='import') が再生成される。
--
-- 実行方式（必ず ON_ERROR_STOP=1 で。1 文でも失敗したら全体を巻き戻す）:
--   docker exec -i rinshouji-db \
--     psql -v ON_ERROR_STOP=1 -U rinshouji -d rinshouji_masked < scripts/mask/mask.sql
--
-- 冪等性:
--   ハッシュ（md5）ベースの決定的マスクのため、複数回適用しても結果は同一。
--   ただし本ファイルは「migrate 直後の実データ」に一度だけ適用する運用を想定する。
--
-- 設計の要点:
--   - 世帯単位で姓を統一する。households.family_name / その世帯の
--     household_members.name の姓部分 / 世帯に紐づく deceased_persons の
--     secular_name・sponsor_name の姓部分 / columbarium_units.ihai_name の
--     「○○家」部分は、すべて seed='hh-'||households.id から決まる同一の姓になる。
--   - 氏名は「姓部分を世帯シード・名部分を個人シード」で完全に合成し直す。
--     実データの名（下の名前）も PII のため保持せず架空名へ置換する。
--   - household_id が NULL の孤立故人は seed='dc-'||id で独自の姓を持つ。
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 決定的インデックス関数（seed 文字列 → 0..modulus-1 の非負整数）
--   md5 先頭 8 桁（32bit）を int 化し符号ビットを落として剰余を取る。
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.mask_idx(seed text, modulus int) RETURNS int AS $$
  SELECT ((('x' || substr(md5(seed), 1, 8))::bit(32)::int & 2147483647) % modulus)
$$ LANGUAGE sql IMMUTABLE;

-- ---------------------------------------------------------------------
-- マスク用プール（漢字とカナの並行配列。同一添字で対応）
--   すべて一時テーブル（ON COMMIT DROP）。idx は 0 始まり。
-- ---------------------------------------------------------------------

-- 姓プール（60件）
CREATE TEMP TABLE surname_pool (idx int PRIMARY KEY, kanji text, kana text) ON COMMIT DROP;
INSERT INTO surname_pool (idx, kanji, kana)
SELECT t.ord - 1, t.kanji, t.kana
FROM unnest(
  ARRAY['佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤',
        '吉田','山田','佐々木','山口','松本','井上','木村','林','斎藤','清水',
        '山崎','森','池田','橋本','阿部','石川','山下','中島','石井','小川',
        '前田','岡田','長谷川','藤田','後藤','近藤','村上','遠藤','青木','坂本',
        '斉藤','福田','太田','西村','藤井','岡本','松田','中川','中野','原田',
        '小野','田村','竹内','金子','和田','中山','石田','上田','森田','原'],
  ARRAY['サトウ','スズキ','タカハシ','タナカ','イトウ','ワタナベ','ヤマモト','ナカムラ','コバヤシ','カトウ',
        'ヨシダ','ヤマダ','ササキ','ヤマグチ','マツモト','イノウエ','キムラ','ハヤシ','サイトウ','シミズ',
        'ヤマザキ','モリ','イケダ','ハシモト','アベ','イシカワ','ヤマシタ','ナカジマ','イシイ','オガワ',
        'マエダ','オカダ','ハセガワ','フジタ','ゴトウ','コンドウ','ムラカミ','エンドウ','アオキ','サカモト',
        'サイトウ','フクダ','オオタ','ニシムラ','フジイ','オカモト','マツダ','ナカガワ','ナカノ','ハラダ',
        'オノ','タムラ','タケウチ','カネコ','ワダ','ナカヤマ','イシダ','ウエダ','モリタ','ハラ']
) WITH ORDINALITY AS t(kanji, kana, ord);

-- 名プール（60件）
CREATE TEMP TABLE given_pool (idx int PRIMARY KEY, kanji text, kana text) ON COMMIT DROP;
INSERT INTO given_pool (idx, kanji, kana)
SELECT t.ord - 1, t.kanji, t.kana
FROM unnest(
  ARRAY['一郎','二郎','三郎','太郎','健一','健二','誠','清','修','博',
        '隆','実','明','豊','勇','茂','進','正雄','秀夫','和夫',
        '幸雄','昭二','敏夫','光男','義雄','春樹','直樹','大輔','拓也','翔太',
        '花子','幸子','洋子','京子','恵子','久美子','由美子','美智子','節子','和子',
        '敏子','順子','陽子','裕子','直子','真由美','美穂','愛','舞','彩',
        '麻衣','桜','美咲','陽菜','結衣','大樹','亮','涼子','千代','文子'],
  ARRAY['イチロウ','ジロウ','サブロウ','タロウ','ケンイチ','ケンジ','マコト','キヨシ','オサム','ヒロシ',
        'タカシ','ミノル','アキラ','ユタカ','イサム','シゲル','ススム','マサオ','ヒデオ','カズオ',
        'ユキオ','ショウジ','トシオ','ミツオ','ヨシオ','ハルキ','ナオキ','ダイスケ','タクヤ','ショウタ',
        'ハナコ','サチコ','ヨウコ','キョウコ','ケイコ','クミコ','ユミコ','ミチコ','セツコ','カズコ',
        'トシコ','ジュンコ','ヨウコ','ユウコ','ナオコ','マユミ','ミホ','アイ','マイ','アヤ',
        'マイ','サクラ','ミサキ','ヒナ','ユイ','ダイキ','リョウ','リョウコ','チヨ','フミコ']
) WITH ORDINALITY AS t(kanji, kana, ord);

-- 戒名合成プール（院号 20 / 道号 20 / 戒名 20 / 位号 4）。仏教的に自然な架空語のみ。
CREATE TEMP TABLE ingou_pool (idx int PRIMARY KEY, val text) ON COMMIT DROP;
INSERT INTO ingou_pool (idx, val)
SELECT t.ord - 1, t.val FROM unnest(
  ARRAY['慈光院','徳雲院','浄安院','明鏡院','円通院','宝樹院','法性院','清心院','高徳院','瑞雲院',
        '一峰院','大観院','松月院','香山院','智照院','蓮生院','天真院','妙音院','玄峰院','龍門院']
) WITH ORDINALITY AS t(val, ord);

CREATE TEMP TABLE dougou_pool (idx int PRIMARY KEY, val text) ON COMMIT DROP;
INSERT INTO dougou_pool (idx, val)
SELECT t.ord - 1, t.val FROM unnest(
  ARRAY['天山','白雲','明月','春風','秋水','幽谷','玄海','清流','高岳','玉泉',
        '竹林','松室','梅林','花岳','月心','雪峰','智岳','徳翁','円心','香林']
) WITH ORDINALITY AS t(val, ord);

CREATE TEMP TABLE kaimyo_name_pool (idx int PRIMARY KEY, val text) ON COMMIT DROP;
INSERT INTO kaimyo_name_pool (idx, val)
SELECT t.ord - 1, t.val FROM unnest(
  ARRAY['宗心','浄圓','妙法','道円','慧光','善成','智徳','法音','真如','覚道',
        '玄要','浄心','徳峰','妙清','円成','宗玄','良俊','慈仙','大観','清安']
) WITH ORDINALITY AS t(val, ord);

-- 位号（居士＝男性在家・大姉＝女性在家・信士／信女）
CREATE TEMP TABLE igou_pool (idx int PRIMARY KEY, val text) ON COMMIT DROP;
INSERT INTO igou_pool (idx, val)
SELECT t.ord - 1, t.val FROM unnest(
  ARRAY['居士','大姉','信士','信女']
) WITH ORDINALITY AS t(val, ord);

-- ---------------------------------------------------------------------
-- 1. 認証アカウント / 手入力パーティの除去（PII を含む手入力データ）
--    user_accounts を先に空にしてから parties(manual) を削除する
--    （user_accounts.party_id は ON DELETE RESTRICT のため順序が重要）。
--    parties(manual) の email / phone / address / note もこの DELETE で消える。
--    party_roles / household_memberships は FK CASCADE で自動削除される。
--    parties(origin='import') は触らない（後続の migrate:parties が再生成する）。
-- ---------------------------------------------------------------------
TRUNCATE TABLE user_accounts;
DELETE FROM parties WHERE origin = 'manual';

-- ---------------------------------------------------------------------
-- 2. 世帯（households）
--    family_name は世帯シードで決定（household_members 等と同じ姓になる）。
--    連絡先・住所は id ベースの架空値。元が NULL の列は NULL のまま。
-- ---------------------------------------------------------------------
UPDATE households h
SET family_name = sp.kanji
FROM surname_pool sp
WHERE h.family_name IS NOT NULL
  AND sp.idx = pg_temp.mask_idx('hh-' || h.id::text, (SELECT count(*)::int FROM surname_pool));

UPDATE households SET
  postal_code  = CASE WHEN postal_code  IS NOT NULL
                      THEN '486-99' || lpad((id % 100)::text, 2, '0') END,
  address_1    = CASE WHEN address_1    IS NOT NULL
                      THEN '愛知県春日野市美坂' || ((id % 30) + 1)::text || '丁目'
                        || ((id % 50) + 1)::text || '番地' END,
  address_2    = NULL,
  phone        = CASE WHEN phone        IS NOT NULL
                      THEN '0568-99-' || lpad((id % 10000)::text, 4, '0') END,
  mobile_phone = CASE WHEN mobile_phone IS NOT NULL
                      THEN '090-0000-' || lpad((id % 10000)::text, 4, '0') END,
  note         = NULL;

-- ---------------------------------------------------------------------
-- 3. 世帯構成員（household_members）
--    姓 = 世帯シード / 名 = 個人シード（'mb-'||id）で完全合成。
--    name_kana は元が非 NULL の場合のみ整合するカナで再構成（現戸主のみ）。
-- ---------------------------------------------------------------------
UPDATE household_members m
SET name      = sp.kanji || '　' || gp.kanji,
    name_kana = CASE WHEN m.name_kana IS NOT NULL THEN sp.kana || gp.kana END,
    note      = NULL
FROM surname_pool sp, given_pool gp
WHERE sp.idx = pg_temp.mask_idx('hh-' || m.household_id::text, (SELECT count(*)::int FROM surname_pool))
  AND gp.idx = pg_temp.mask_idx('mb-' || m.id::text,          (SELECT count(*)::int FROM given_pool));

-- ---------------------------------------------------------------------
-- 4. 故人（deceased_persons）
--    俗名・施主名: 姓 = 世帯シード（孤立故人は 'dc-'||id）/ 名 = 個人シード。
--    secular_name_kana は元が非 NULL のときのみ整合。
--    death_* / age_at_death / legacy_* は年忌機能に必要なため保持。
-- ---------------------------------------------------------------------
UPDATE deceased_persons d
SET secular_name      = CASE WHEN d.secular_name      IS NOT NULL THEN sp.kanji || gp.kanji END,
    secular_name_kana = CASE WHEN d.secular_name_kana IS NOT NULL THEN sp.kana  || gp.kana  END,
    sponsor_name      = CASE WHEN d.sponsor_name      IS NOT NULL THEN sp.kanji || sg.kanji END
FROM surname_pool sp, given_pool gp, given_pool sg
WHERE sp.idx = pg_temp.mask_idx(
        CASE WHEN d.household_id IS NOT NULL
             THEN 'hh-' || d.household_id::text
             ELSE 'dc-' || d.id::text END,
        (SELECT count(*)::int FROM surname_pool))
  AND gp.idx = pg_temp.mask_idx('dcg-' || d.id::text, (SELECT count(*)::int FROM given_pool))
  AND sg.idx = pg_temp.mask_idx('sp-'  || d.id::text, (SELECT count(*)::int FROM given_pool));

-- 戒名: 院号＋道号＋戒名＋位号を決定的合成（'dc-'||id 由来）。元が NULL は NULL のまま。
UPDATE deceased_persons d
SET kaimyo = ing.val || dou.val || kai.val || igo.val
FROM ingou_pool ing, dougou_pool dou, kaimyo_name_pool kai, igou_pool igo
WHERE d.kaimyo IS NOT NULL
  AND ing.idx = pg_temp.mask_idx('dci-' || d.id::text, (SELECT count(*)::int FROM ingou_pool))
  AND dou.idx = pg_temp.mask_idx('dcd-' || d.id::text, (SELECT count(*)::int FROM dougou_pool))
  AND kai.idx = pg_temp.mask_idx('dck-' || d.id::text, (SELECT count(*)::int FROM kaimyo_name_pool))
  AND igo.idx = pg_temp.mask_idx('dci2-'|| d.id::text, (SELECT count(*)::int FROM igou_pool));

-- 自由記述・注記は一律 NULL。
UPDATE deceased_persons SET kaimyo_note = NULL, notice_note = NULL, note = NULL;

-- ---------------------------------------------------------------------
-- 5. 納骨堂区画（columbarium_units）
--    ihai_name は世帯姓で「○○家…」の姓部分を差し替え。「家」を含まない
--    （個人名の位牌等）場合は「○○家」で完全置換。備考は自由記述のため NULL。
-- ---------------------------------------------------------------------
UPDATE columbarium_units c
SET ihai_name = CASE
      WHEN c.ihai_name IS NULL THEN NULL
      WHEN position('家' in c.ihai_name) > 0
        THEN sp.kanji || '家' || regexp_replace(c.ihai_name, '^.*?家', '')
      ELSE sp.kanji || '家' END,
    note = NULL
FROM surname_pool sp
WHERE sp.idx = pg_temp.mask_idx('hh-' || c.household_id::text, (SELECT count(*)::int FROM surname_pool));

-- ---------------------------------------------------------------------
-- 6. 墓地区画（cemetery_plots）
--    自由記述の備考のみ NULL（plot_code / 金額 / 日付は非 PII のため保持）。
-- ---------------------------------------------------------------------
UPDATE cemetery_plots SET note = NULL;

-- ---------------------------------------------------------------------
-- 7. 取込レコード（import_records）
--    raw_data に CSV 全列の原文（氏名・住所・電話等）が入るため空 JSONB へ。
--    raw_data は NOT NULL のため NULL ではなく '{}'::jsonb を入れる。
-- ---------------------------------------------------------------------
UPDATE import_records SET raw_data = '{}'::jsonb WHERE raw_data <> '{}'::jsonb;

COMMIT;
