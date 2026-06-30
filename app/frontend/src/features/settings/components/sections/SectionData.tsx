// データ・バックアップ
import { SettingsHeader } from '../SettingsHeader';

export function SectionData() {
  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="データ出力" desc="管理データをCSV / PDFで一括出力できます。" />
        <div className="sc-body data-grid">
          {[
            { label: '檀家一覧', count: '248件', icon: 'parish' },
            { label: '過去帳',   count: '1,284件', icon: 'memorial' },
            { label: 'お参り記録', count: '4,612件', icon: 'visit' },
            { label: '法要予定', count: '156件', icon: 'sched' },
          ].map((it, i) => (
            <div key={i} className="data-card">
              <div className="data-l">{it.label}</div>
              <div className="data-c">{it.count}</div>
              <div className="data-actions">
                <button className="btn ghost sm" type="button">CSV</button>
                <button className="btn ghost sm" type="button">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-card card">
        <SettingsHeader title="バックアップ" desc="日次で自動バックアップを行っています。" />
        <div className="sc-body">
          <div className="bk-status">
            <div>
              <div className="bk-l">最終バックアップ</div>
              <div className="bk-v">2026年5月12日 03:00<span className="ok-pill">成功</span></div>
            </div>
            <button className="btn outline" type="button">今すぐバックアップ</button>
          </div>
          <table className="bk-table">
            <thead><tr><th>日時</th><th>サイズ</th><th>状態</th><th></th></tr></thead>
            <tbody>
              {[
                ['2026-05-12 03:00', '142 MB', 'success'],
                ['2026-05-11 03:00', '141 MB', 'success'],
                ['2026-05-10 03:00', '141 MB', 'success'],
                ['2026-05-09 03:00', '140 MB', 'success'],
                ['2026-05-08 03:00', '139 MB', 'success'],
              ].map(([d, sz], i) => (
                <tr key={i}>
                  <td className="mono">{d}</td>
                  <td className="mono">{sz}</td>
                  <td><span className="ok-pill sm">成功</span></td>
                  <td><button className="btn ghost sm" type="button">復元</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
