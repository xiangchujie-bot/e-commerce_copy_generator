import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

const testFlowSteps = [
  {
    id: 'single',
    icon: '📝',
    title: '路径A：单个录入 → 生成',
    desc: '手动填写商品信息、上传图片、保存到素材库、立即生成文案和主图',
    action: '去添加商品（自动填充）',
    path: '/create?test=1',
  },
  {
    id: 'batch',
    icon: '📥',
    title: '路径B：批量导入 → 生成',
    desc: 'Excel 批量导入 → 预览修正 → 确认导入 → 回工作台批量生成',
    action: '去批量导入（加载示例）',
    path: '/import?test=1',
  },
  {
    id: 'generate',
    icon: '⚡',
    title: '路径C：生成待处理商品',
    desc: '对工作台已有的"待生成"商品点击生成，查看文案和主图草稿',
    action: '生成第一个待处理商品',
    path: '__first_pending__',
  },
  {
    id: 'view',
    icon: '👁️',
    title: '路径D：查看已生成结果',
    desc: '查看已生成商品的文案、编辑/复制文案、下载主图、收藏为模板',
    action: '查看已生成结果',
    path: '__first_generated__',
  },
]

export default function Workbench() {
  const { products } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(new Set())
  const [showTestPanel, setShowTestPanel] = useState(true)

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

  const handleTestNav = (step) => {
    if (step.path === '__first_pending__') {
      const p = products.find((x) => x.status === 'pending')
      if (p) navigate(`/generate/${p.id}`)
      else alert('没有待生成的商品')
    } else if (step.path === '__first_generated__') {
      const p = products.find((x) => x.status === 'generated')
      if (p) navigate(`/generate/${p.id}`)
      else alert('没有已生成的商品')
    } else {
      navigate(step.path)
    }
  }

  return (
    <div>
      {/* 🧪 测试引导面板 */}
      {showTestPanel && (
        <div className="mb-6 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <h3 className="text-white font-bold text-sm">全流程测试入口</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">点击按钮快速测试</span>
            </div>
            <button
              onClick={() => setShowTestPanel(false)}
              className="text-txt-disabled hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
            >
              收起 ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testFlowSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-xs font-bold mb-1">{step.title}</h4>
                  <p className="text-txt-disabled text-[11px] mb-2 leading-relaxed">{step.desc}</p>
                  <button
                    onClick={() => handleTestNav(step)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-all"
                  >
                    {step.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-txt-disabled text-[10px] mt-3 text-center">
            💡 提示：路径A/B 会自动填充测试数据，无需手动输入。测试完成后可收起此面板。
          </p>
        </div>
      )}

      {/* 收起后的展开按钮 */}
      {!showTestPanel && (
        <button
          onClick={() => setShowTestPanel(true)}
          className="mb-4 text-xs text-primary hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          🧪 展开测试面板
        </button>
      )}

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
