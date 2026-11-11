import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDemo } from '../demo-context'

export function Layout() {
  const { resetDemo } = useDemo()
  const navigate = useNavigate()

  const reset = () => {
    if (!window.confirm('デモデータを最初の状態に戻しますか？')) return
    resetDemo()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">あ</span>
          <div>
            <strong>あおば青果（デモ）</strong>
            <small>FAX注文の確認</small>
          </div>
        </div>
        <nav aria-label="メインメニュー">
          <NavLink to="/" end>
            受信箱
          </NavLink>
          <NavLink to="/daily">納品必要量</NavLink>
        </nav>
        <button className="reset" type="button" onClick={reset}>
          デモデータを初期化
        </button>
        <p className="sidebar-note">掲載用の架空データです。実在の取引先ではありません。</p>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">AOBA DEMO</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">{children}</div>
    </header>
  )
}
