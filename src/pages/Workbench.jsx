import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Workbench() {
  const { products } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(new Set())

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  const handleBatchGenerate = () => {
    if (selected.size === 0) return
    const first = [...selected][0]
    navigate(`/generate/${first}`)
  }

  const pendingCount = products.filter((p) => p.status === 'pending').length
  const generatedCount = products.filter((p) => p.status === 'generated').length

  return (
    <div>
      {/* 页面标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">待生成商品</h2>
          <p className="text-txt-secondary text-sm mt-1">
            共 <span className="text-white font-mono">{products.length}</span> 个商品
            <span className="mx-2 text-txt-disabled">·</span>
            <span className="text-warning">{pendingCount} 待生成</span>
            <span className="mx-2 text-txt-disabled">·</span>
            <span className="text-success">{generatedCount} 已生成</span>
          </p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-5 glass rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={products.length > 0 && selected.size === products.length}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            全选
          </label>
          {selected.size > 0 && (
            <span className="text-xs text-txt-disabled">已选 {selected.size} 个</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/create')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-all duration-200 hover:scale-[1.02]"
          >
            + 添加商品
          </button>
          <button
            onClick={() => navigate('/import')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-txt-secondary hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            📥 批量导入
          </button>
          <button
            onClick={handleBatchGenerate}
            disabled={selected.size === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent/15 text-accent hover:bg-accent/25 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▶ 批量生成{selected.size > 0 ? `（已选 ${selected.size} 个）` : ''}
          </button>
        </div>
      </div>

      {/* 商品卡片网格 */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-txt-secondary text-lg mb-2">还没有商品</h3>
          <p className="text-txt-disabled text-sm mb-6">添加商品或批量导入，开始生成主图文案</p>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/80 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
          >
            + 添加第一个商品
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selected.has(product.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
