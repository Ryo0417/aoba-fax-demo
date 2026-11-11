import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { useDemo } from '../demo-context'
import { formatDateTime } from '../format'
import { FAX_STATUS_LABEL, type FaxStatus } from '../types'

type Filter = 'open' | 'confirmed'

export function InboxPage() {
  const { state, receiveNewFax } = useDemo()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('open')
  const [notice, setNotice] = useState<string | null>(null)

  const rows = [...state.faxes]
    .filter((fax) => (filter === 'confirmed' ? fax.status === 'confirmed' : fax.status !== 'confirmed'))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))

  const receive = () => {
    const accepted = receiveNewFax()
    setNotice(accepted ? 'メールから新しいFAXを取り込みました。読み取りが終わるまで少々お待ちください。' : '受信待ちのFAXはありません。初期化するとやり直せます。')
  }

  return (
    <>
      <PageHeader title="FAX受信箱">
        <button className="button" type="button" onClick={receive} disabled={state.incoming.length === 0}>
          新着FAXを受信
        </button>
      </PageHeader>
      <section className="panel">
        <p className="lead">
          複合機からメールで届いた注文書が、ここに自動で入ります。読み取りが終わると「確認待ち」になり、人が原本と見比べて確定します。
        </p>
        {notice && <p className="notice">{notice}</p>}
        <div className="filters">
          <label>
            表示
            <select value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
              <option value="open">未処理</option>
              <option value="confirmed">確定済み</option>
            </select>
          </label>
          <p className="waiting">受信待ち {state.incoming.length}件</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>受信日時</th>
                <th>得意先</th>
                <th>ファイル</th>
                <th>状態</th>
                <th>明細</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((fax) => {
                const count = state.lines.filter((line) => line.faxId === fax.id).length
                const customer = state.customers.find((item) => item.id === fax.customerId)
                return (
                  <tr key={fax.id} className="clickable" onClick={() => navigate(`/inbox/${fax.id}`)}>
                    <td>{formatDateTime(fax.receivedAt)}</td>
                    <td>{customer?.name ?? '（未判定）'}</td>
                    <td>{fax.originalFilename}</td>
                    <td>
                      <span className={`badge ${fax.status}`}>{FAX_STATUS_LABEL[fax.status as FaxStatus]}</span>
                    </td>
                    <td>{fax.status === 'processing' ? '—' : `${count}行`}</td>
                    <td>
                      {fax.status === 'processing' ? (
                        '読み取り中'
                      ) : (
                        <Link to={`/inbox/${fax.id}`} onClick={(event) => event.stopPropagation()}>
                          開く
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="empty">該当するFAXはありません。</p>}
      </section>
    </>
  )
}
