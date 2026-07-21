/**
 * フェーズ③: household_members → parties / household_memberships / party_roles。
 * household_members は正規化済みの「並存期の正データ」であり、本フェーズは
 * そこから parties 側の派生データ（origin='import'）を再生成するだけ。
 * 呼び出し元の既存トランザクション内で実行する（BEGIN/COMMIT はしない）。
 */
import type { PoolClient } from 'pg';
import type { Report } from './report.js';

const SRC = 'parties';

interface HouseholdMemberRow {
  readonly id: number;
  readonly householdId: number;
  readonly memberRole: string;
  readonly name: string;
  readonly nameKana: string | null;
  readonly successionOrder: number | null;
}

export async function buildParties(client: PoolClient, report: Report): Promise<void> {
  const parishionerRoleTypeId = await fetchParishionerRoleTypeId(client);
  await guardAndDeleteImportParties(client, report);

  const members = await loadHouseholdMembers(client);
  for (const member of members) {
    await insertPartyForMember(client, member, parishionerRoleTypeId, report);
  }
}

/** role_types.code='parishioner' の id を取得。無ければスキーマ未適用として fail fast。 */
async function fetchParishionerRoleTypeId(client: PoolClient): Promise<number> {
  const res = await client.query<{ id: string }>(
    `SELECT id FROM role_types WHERE code = 'parishioner'`,
  );
  if (res.rows.length === 0) {
    throw new Error(
      "role_types に code='parishioner' が見つかりません。db/init/01_schema.sql が未適用の可能性があります。",
    );
  }
  return Number(res.rows[0]!.id);
}

/**
 * origin='import' の party に user_accounts が付与されているものは
 * 手動でアカウントが紐付けられた＝再生成対象外として警告し、削除から除外する。
 * 除外条件つきの DELETE のため、party_roles / household_memberships は
 * CASCADE で自動的に消える（parties 本体を残す行の子は残る）。
 */
async function guardAndDeleteImportParties(client: PoolClient, report: Report): Promise<void> {
  const guarded = await client.query<{ id: string; display_name: string }>(
    `SELECT p.id, p.display_name
       FROM parties p
      WHERE p.origin = 'import'
        AND EXISTS (SELECT 1 FROM user_accounts ua WHERE ua.party_id = p.id)`,
  );
  for (const row of guarded.rows) {
    report.warn(
      'parties import由来だがuser_accounts付与済み（削除対象から除外）',
      SRC,
      Number(row.id),
      row.display_name,
    );
  }

  await client.query(
    `DELETE FROM parties p
      WHERE p.origin = 'import'
        AND NOT EXISTS (SELECT 1 FROM user_accounts ua WHERE ua.party_id = p.id)`,
  );
}

async function loadHouseholdMembers(client: PoolClient): Promise<HouseholdMemberRow[]> {
  const res = await client.query<{
    id: string;
    household_id: string;
    member_role: string;
    name: string;
    name_kana: string | null;
    succession_order: number | null;
  }>(
    `SELECT id, household_id, member_role, name, name_kana, succession_order
       FROM household_members
      ORDER BY id`,
  );
  return res.rows.map((r) => ({
    id: Number(r.id),
    householdId: Number(r.household_id),
    memberRole: r.member_role,
    name: r.name,
    nameKana: r.name_kana,
    successionOrder: r.succession_order,
  }));
}

async function insertPartyForMember(
  client: PoolClient,
  member: HouseholdMemberRow,
  parishionerRoleTypeId: number,
  report: Report,
): Promise<void> {
  const partyRes = await client.query<{ id: string }>(
    `INSERT INTO parties (party_type, display_name, display_name_kana, origin)
     VALUES ('person', $1, $2, 'import')
     RETURNING id`,
    [member.name.slice(0, 100), member.nameKana?.slice(0, 100) ?? null],
  );
  const partyId = Number(partyRes.rows[0]!.id);
  report.counts.partiesImported += 1;

  await client.query(
    `INSERT INTO household_memberships
       (party_id, household_id, member_role, succession_order, household_member_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [partyId, member.householdId, member.memberRole, member.successionOrder, member.id],
  );
  report.counts.householdMemberships += 1;

  await client.query(
    `INSERT INTO party_roles (party_id, role_type_id, status, valid_from, valid_to)
     VALUES ($1,$2,'active',NULL,NULL)`,
    [partyId, parishionerRoleTypeId],
  );
  report.counts.partyRoles += 1;
}
