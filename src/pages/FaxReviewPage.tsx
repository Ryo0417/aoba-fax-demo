import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/Layout'
import { useDemo } from '../demo-context'
import { demoToday } from '../demo-today'
import { addDays, formatDateTime } from '../format'
import { FAX_STATUS_LABEL, UNITS, type OrderLine } from '../types'

function linesOf(lines: OrderLine[], faxId: string | undefined): OrderLine[] {
  return lines.filter((line) => line.faxId === faxId).map((line) => ({ ...line }))
}

export function FaxReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, saveFax, confirmFax, revertFax } = useDemo()
  const fax = state.faxes.find((item) => item.id === id)
  const [boundId, setBoundId] = useState(id)
  const [customerId, setCustomerId] = useState(fax?.customerId ?? '')
  const [draft, setDraft] = useState<OrderLine[]>(() => linesOf(state.lines, id))
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (fax && id !== boundId) {
    setBoundId(id)
    setCustomerId(fax.customerId)
    setDraft(linesOf(state.lines, id))
    setMessage(null)
    setError(null)
  }

  if (!fax) {
    return (
      <section className="panel">
        <p>FAXが見つかりません。</p>
        <Link to="/">受信箱へ戻る</Link>
      </section>
    )
  }

  const locked = fax.status === 'confirmed'
  const reading = fax.status === 'processing'

  const patchLine = (lineId: string, partial: Partial<OrderLine>) => {
    setDraft((rows) =>
      rows.map((line) => (line.id === lineId ? { ...line, ...partial, needsReview: false } : line)),
    )
  }

  const addLine = () => {
    const sample = draft[0]
    setDraft((rows) => [
      ...rows,
      {
        id: `new-${Date.now()}`,
        faxId: fax.id,
        deliveryDate: sample?.deliveryDate ?? addDays(demoToday, 2),
        itemName: '',
        quantity: '1',
        unit: 'kg',
        note: '',
        needsReview: false,
      },
    ])
  }

  const validate = (): string | null => {
    if (!customerId) return '得意先を選んでください。'
    if (draft.length === 0) return '明細が1行もありません。'
    if (draft.some((line) => !line.itemName.trim())) return '品名が空の行があります。'
    if (draft.some((line) => !/^\d+(\.\d+)?$/.test(line.quantity) || Number(line.quantity) <= 0)) {
      return '数量は0より大きい数にしてください。'
    }
    return null
  }

  const save = () => {
    const problem = validate()
    if (problem) {
      setError(problem)
      setMessage(null)
      return
    }
    saveFax(fax.id, customerId, draft)
    setError(null)
    setMessage('下書きを保存しました。まだ確定していません。')
  }

  const confirm = () => {
    const problem = validate()
    if (problem) {
      setError(problem)
      setMessage(null)
      return
    }
    confirmFax(fax.id, customerId, draft)
    navigate('/')
  }

  const revert = () => {
    revertFax(fax.id)
    setError(null)
    setMessage('確定を取り消し、下書きに戻しました。')
  }

  return (
    <>
      <PageHeader title={fax.originalFilename}>
        <Link className="button secondary" to="/">
          受信箱へ戻る
        </Link>
      </PageHeader>
      <p className="meta-line">
        受信 {formatDateTime(fax.receivedAt)}
        <span className={`badge ${fax.status}`}>{FAX_STATUS_LABEL[fax.status]}</span>
        {fax.confirmedAt && <span>確定 {formatDateTime(fax.confirmedAt)}</span>}
      </p>
      {reading && <p className="notice">注文書を読み取っています。しばらくすると明細が表示されます。</p>}
      <div className="review">
        <section className="panel pdf-pane">
          <h2>原本</h2>
          <iframe title="原本PDF" src={fax.pdfUrl} />
        </section>
        <section className="panel">
          <h2>読み取り結果</h2>
          {reading ? (
            <p className="empty">読み取り中です。</p>
          ) : (
            <>
              <p className="lead">黄色の行は、手書きなどで読み取りに自信がない行です。原本と見比べて直してから確定してください。</p>
              <label>
                得意先
                <select value={customerId} disabled={locked} onChange={(event) => setCustomerId(event.target.value)}>
                  <option value="">選んでください</option>
                  {state.customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="table-wrap">
                <table className="lines">
                  <thead>
                    <tr>
                      <th>納品日</th>
                      <th>品名</th>
                      <th>数量</th>
                      <th>単位</th>
                      <th>備考</th>
                      {!locked && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {draft.map((line) => (
                      <tr key={line.id} className={line.needsReview ? 'needs-review' : undefined}>
                        <td>
                          <input
                            type="date"
                            value={line.deliveryDate}
                            disabled={locked}
                            onChange={(event) => patchLine(line.id, { deliveryDate: event.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            list="item-names"
                            value={line.itemName}
                            disabled={locked}
                            onChange={(event) => patchLine(line.id, { itemName: event.target.value })}
                          />
                          {line.needsReview && <span className="review-flag">要確認</span>}
                        </td>
                        <td>
                          <input
                            value={line.quantity}
                            disabled={locked}
                            inputMode="decimal"
                            onChange={(event) => patchLine(line.id, { quantity: event.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            value={line.unit}
                            disabled={locked}
                            onChange={(event) => patchLine(line.id, { unit: event.target.value })}
                          >
                            {UNITS.map((unit) => (
                              <option key={unit}>{unit}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            value={line.note}
                            disabled={locked}
                            onChange={(event) => patchLine(line.id, { note: event.target.value })}
                          />
                        </td>
                        {!locked && (
                          <td>
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => setDraft((rows) => rows.filter((item) => item.id !== line.id))}
                            >
                              削除
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <datalist id="item-names">
                {state.items.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
              {!locked && (
                <div className="form-footer">
                  <button className="text-button" type="button" onClick={addLine}>
                    行を追加
                  </button>
                  <div className="header-actions">
                    <button className="button secondary" type="button" onClick={save}>
                      下書き保存
                    </button>
                    <button className="button" type="button" onClick={confirm}>
                      確定
                    </button>
                  </div>
                </div>
              )}
              {error && <p className="error">{error}</p>}
              {message && <p className="success">{message}</p>}
              {locked && (
                <div className="form-footer">
                  <p className="success">この注文書は確定済です。</p>
                  <button className="button secondary" type="button" onClick={revert}>
                    確定を取り消して下書きに戻す
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
