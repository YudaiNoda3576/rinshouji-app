import { Pill } from '@/components/ui/Pill';

import {
  formatDeathDate,
  formatDistrict,
  formatFamilyName,
  formatFee,
  formatHeadName,
  formatPaidOn,
  formatPhone,
  formatPostal,
  formatWidth,
  relationPillColor,
} from '../constants';
import type { HouseholdDetail, Member } from '../types';

interface ParishDetailProps {
  detail: HouseholdDetail;
  onEdit: () => void;
  onSelectDeceased?: (id: number) => void;
}

const MEMBER_ROLE_LABEL: Record<Member['memberRole'], string> = {
  head: '現戸主',
  family: '家族',
  former_head: '前戸主履歴',
};

export function ParishDetail({ detail, onEdit, onSelectDeceased }: ParishDetailProps) {
  const { household, members, cemeteryPlots, columbariumUnits, deceased } = detail;
  const head = members.find(m => m.memberRole === 'head');
  const family = members.filter(m => m.memberRole === 'family');
  const formerHeads = [...members.filter(m => m.memberRole === 'former_head')].sort(
    (a, b) => (a.successionOrder ?? 0) - (b.successionOrder ?? 0),
  );
  const isDeleted = household.status === 'deleted';

  const hasEventInfo =
    household.hannyaService ||
    household.sejikiService ||
    household.tanagyoSchedule ||
    household.monthlyServiceDay ||
    household.jizoFlag;

  return (
    <>
      <header style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div className="pd-top">
          <div>
            <h3>
              {formatFamilyName(household.familyName)}
              {household.status === 'inactive' && <span className="pill pill-gray pd-status">離檀</span>}
              {isDeleted && <span className="pill pill-red pd-status">削除済み</span>}
            </h3>
            <div className="detail-id">
              {formatHeadName(head?.name ?? null)}
              {head?.nameKana && <span className="pd-kana">（{head.nameKana}）</span>}
            </div>
          </div>
        </div>
        {isDeleted && <div className="pd-warning">この世帯は削除済みです。</div>}
      </header>

      <div className="detail-body">
        <div className="kv-list">
          <div className="kv"><span>地区</span><b>{formatDistrict(household.district1, household.district2)}</b></div>
          <div className="kv"><span>関係区分</span><b>
            {household.relationType
              ? <Pill color={relationPillColor(household.relationType)}>{household.relationType}</Pill>
              : <Pill color="gray">未設定</Pill>}
          </b></div>
          <div className="kv"><span>電話</span><b>{formatPhone(household.phone, null)}</b></div>
          <div className="kv"><span>携帯</span><b>{household.mobilePhone || '—'}</b></div>
          <div className="kv"><span>住所</span><b style={{ maxWidth: 220, textAlign: 'right', whiteSpace: 'normal', lineHeight: 1.4 }}>
            {[formatPostal(household.postalCode), household.address1, household.address2]
              .filter(Boolean)
              .join(' ') || '—'}
          </b></div>
          <div className="kv"><span>位牌</span><b>
            {household.ihaiStatus
              ? <Pill color={household.ihaiStatus === 'あり' ? 'blue' : 'gray'}>{household.ihaiStatus}</Pill>
              : <Pill color="gray">未設定</Pill>}
          </b></div>
        </div>

        {/* 墓地区画 */}
        <div className="detail-section">
          <div className="ds-head">墓地区画 <span>{cemeteryPlots.length}件</span></div>
          {cemeteryPlots.length === 0
            ? <div className="pd-empty">墓地区画なし</div>
            : (
              <div className="plot-list">
                {cemeteryPlots.map(p => (
                  <div key={p.id} className="plot-card">
                    <div className="plot-code">{p.plotCode || '（区画コードなし）'}</div>
                    <div className="plot-meta">
                      <span>幅</span><b>{formatWidth(p.widthCm)}</b>
                      <span>墓地代</span><b>{formatFee(p.fee)}</b>
                      <span>入金日</span><b>{formatPaidOn(p)}</b>
                    </div>
                    {p.note && <div className="plot-note">{p.note}</div>}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* 納骨堂区画 */}
        <div className="detail-section">
          <div className="ds-head">納骨堂区画 <span>{columbariumUnits.length}件</span></div>
          {columbariumUnits.length === 0
            ? <div className="pd-empty">納骨堂区画なし</div>
            : (
              <div className="plot-list">
                {columbariumUnits.map(u => (
                  <div key={u.id} className="plot-card">
                    <div className="plot-code">
                      {u.unitCode || '（区画コードなし）'}
                      {u.unitType && <Pill color="purple">{u.unitType}</Pill>}
                    </div>
                    {u.ihaiName && <div className="plot-meta"><span>位牌名</span><b>{u.ihaiName}</b></div>}
                    {u.note && <div className="plot-note">{u.note}</div>}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* 行事区分 */}
        <div className="detail-section">
          <div className="ds-head">行事区分</div>
          {hasEventInfo ? (
            <div className="kv-list">
              {household.hannyaService && <div className="kv"><span>般若</span><b>{household.hannyaService}</b></div>}
              {household.sejikiService && <div className="kv"><span>施食</span><b>{household.sejikiService}</b></div>}
              {household.tanagyoSchedule && <div className="kv"><span>棚経</span><b>{household.tanagyoSchedule}</b></div>}
              {household.monthlyServiceDay && <div className="kv"><span>月参り日</span><b>{household.monthlyServiceDay}</b></div>}
              {household.jizoFlag && <div className="kv"><span>地蔵</span><b><Pill color="green">あり</Pill></b></div>}
            </div>
          ) : <div className="pd-empty">設定なし</div>}
        </div>

        {/* 家族構成 */}
        <div className="detail-section">
          <div className="ds-head">家族構成 <span>{members.length}名</span></div>
          {members.length === 0
            ? <div className="pd-empty">家族の登録なし</div>
            : (
              <div className="member-list">
                {head && <MemberRow member={head} roleLabel={MEMBER_ROLE_LABEL.head} />}
                {family.map(m => <MemberRow key={m.id} member={m} roleLabel={MEMBER_ROLE_LABEL.family} />)}
                {formerHeads.map((m, i) => (
                  <MemberRow key={m.id} member={m} roleLabel={`${i + 1}代目前戸主`} />
                ))}
              </div>
            )}
        </div>

        {/* この世帯の過去帳 */}
        <div className="detail-section">
          <div className="ds-head">この世帯の過去帳 <span>{deceased.length}名</span></div>
          {deceased.length === 0
            ? <div className="pd-empty">過去帳登録なし</div>
            : (
              <div className="deceased-list">
                {deceased.map(d => (
                  <button key={d.id} type="button" className="deceased-row"
                          onClick={() => onSelectDeceased?.(d.id)}>
                    <span className="dc-kaimyo">{d.kaimyo || '（戒名なし）'}</span>
                    <span className="dc-date">{formatDeathDate(d)}</span>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* 備考 */}
        {household.note && (
          <div className="note-block">
            <div className="l">備考</div>
            <p>{household.note}</p>
          </div>
        )}

        <div className="action-row">
          <button className="btn primary" onClick={onEdit} disabled={isDeleted}>
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            編集する
          </button>
        </div>
      </div>
    </>
  );
}

function MemberRow({ member, roleLabel }: { member: Member; roleLabel: string }) {
  return (
    <div className="member-row">
      <div className="m-rel">{roleLabel}</div>
      <div className="m-info">
        <div className="m-name">{member.name || '（氏名なし）'}</div>
        {member.nameKana && <div className="m-sub">{member.nameKana}</div>}
        {member.note && <div className="m-sub">{member.note}</div>}
      </div>
    </div>
  );
}
