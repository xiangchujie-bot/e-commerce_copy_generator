import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Workbench from './pages/Workbench.jsx'
import CreateProduct from './pages/CreateProduct.jsx'
import ImportProducts from './pages/ImportProducts.jsx'
import GenerateResult from './pages/GenerateResult.jsx'
import Library from './pages/Library.jsx'
import Assets from './pages/Assets.jsx'

const navItems = [
  { to: '/', label: '工作台', icon: '📋' },
  { to: '/library', label: '模板库', icon: '📦' },
  { to: '/assets', label: '素材库', icon: '🖼️' },
]

function Header() {
  const location = useLocation()
  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
          爆
        </div>
        <div>
          <h1 className="text-white text-lg font-bold tracking-wide leading-tight">爆款工厂</h1>
          <p className="text-txt-secondary text-[10px]">AI 驱动 · 电商主图文案生成</p>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-txt-secondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Header />
      <main className="p-6 max-w-[1440px] mx-auto">
        <Routes>
          <Route path="/" element={<Workbench />} />
          <Route path="/create" element={<CreateProduct />} />
          <Route path="/edit/:productId" element={<CreateProduct />} />
          <Route path="/import" element={<ImportProducts />} />
          <Route path="/generate/:productId" element={<GenerateResult />} />
          <Route path="/generate/batch/:batchId" element={<GenerateResult />} />
          <Route path="/library" element={<Library />} />
          <Route path="/assets" element={<Assets />} />
        </Routes>
      </main>
    </div>
  )
}
