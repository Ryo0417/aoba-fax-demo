import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { dailyView, DEFAULT_DAILY_DATE, deliveryDates, itemTotals } from '../daily'
import { useDemo } from '../demo-context'
import { addDays, formatDateJa } from '../format'

type Tab = 'customers' | 'items'

export function DailyPage() {
  const { state } = useDemo()
  const [date, setDate] = useState(DEFAULT_DAILY_DATE)
  const [includeDrafts, setIncludeDrafts] = useState(false)
  const [tab, setTab] = useState<Tab>('customers')

  const dates = useMemo(() => deliveryDates(state, includeDrafts), [state, includeDrafts])
  const blocks = useMemo(() => dailyView(state, date, includeDrafts), [state, date, includeDrafts])
  const totals = useMemo(() => itemTotals(blocks), [blocks])
  const draftCount = state.faxes.filter((fax) => fax.status === 'needs_review').length

  return (
    <>
      <PageHeader title="納品必要量">
        <div className="header-actions">
          <button className="button secondary" type="button" onClick={() => setDate(addDays(date, -1))}>
            前日
          </button>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <button className="button secondary" type="button" onClick={() => setDate(addDays(date, 1))}>
            翌日
          </button>
        </div>
      </PageHeader>
      <section className="panel">
        <div className="daily-tools">
          <strong>{formatDateJa(date)}</strong>
          <span className="badge confirmed">納品日</span>
          <label className="check">
            <input
              type="checkbox"
              checked={includeDrafts}
              onChange={(event) => setIncludeDrafts(event.target.checked)}
            />
            未確定分も含む
          </label>
          {draftCount > 0 && (
            <Link to="/" className="badge needs_review">
              未確定の注文書 {draftCount}件
            </Link>
          )}
        </div>
        <p className="lead">確定した注文書の明細を、納品日ごとに集計しています。品名を開くと、その注文書に戻ります。</p>
        {dates.length > 0 && (
          <div className="date-chips">
            {dates.map((item) => (
              <button
                key={item}
                type="button"
                className={item === date ? 'button' : 'button secondary'}
                onClick={() => setDate(item)}
              >
                {formatDateJa(item).replace(/^\d+年/, '')}
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="tabs">
        <button type="button" className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
          得意先別
        </button>
        <button type="button" className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>
          品目合計
        </button>
      </div>
      {blocks.length === 0 ? (
        <section className="panel">
          <p className="empty">{formatDateJa(date)} の納品日のデータはありません。</p>
          <p className="lead">注文書を確定すると、その明細の納品日に表示されます。未確定も見る場合は上のチェックを入れてください。</p>
        </section>
      ) : tab === 'customers' ? (
        <div className="daily-grid">
          {blocks.map((block) => (
            <section className="panel" key={block.customerId}>
              <h2>{block.customerName}</h2>
              <DailyTable rows={block.rows} showStatus />
            </section>
          ))}
        </div>
      ) : (
        <section className="panel totals">
          <h2>品目合計</h2>
          <p className="lead">同じ品名と単位を、得意先をまたいで足しています。</p>
          <DailyTable rows={totals} showStatus={false} />
        </section>
      )}
    </>
  )
}

function DailyTable({ rows, showStatus }: { rows: { itemName: string; unit: string; qty: number; notes: string[]; needsReview: boolean; confirmed: boolean; faxId: string }[]; showStatus: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>品名</th>
            <th>数量</th>
            <th>単位</th>
            {showStatus && <th>状態</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.faxId}-${row.itemName}-${row.unit}`} className={row.needsReview ? 'needs-review' : undefined}>
              <td>
                <Link to={`/inbox/${row.faxId}`}>{row.itemName}</Link>
                {row.notes.length > 0 && <span className="note">（{row.notes.join('、')}）</span>}
              </td>
              <td className="num">{row.qty}</td>
              <td>{row.unit}</td>
              {showStatus && (
                <td>
                  <span className={`badge ${row.confirmed ? 'confirmed' : 'needs_review'}`}>
                    {row.confirmed ? '確定' : '未確定'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
