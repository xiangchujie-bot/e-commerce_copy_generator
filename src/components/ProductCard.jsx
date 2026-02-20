import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../context/AppContext.jsx'

const statusMap = {
  pending: { label: '待生成', color: 'bg-warning/20 text-warning', dot: 'bg-warning' },
  generating: { label: '生成中', color: 'bg-primary/20 text-primary', dot: 'bg-primary' },
  generated: { label: '已生成', color: 'bg-success/20 text-success', dot: 'bg-success' },
}

const platformColors = {
  '淘宝': 'bg-orange-500/15 text-orange-400',
  '拼多多': 'bg-red-500/15 text-red-400',
  '抖音': 'bg-pink-500/15 text-pink-400',
  '京东': 'bg-red-600/15 text-red-500',
}

export default function ProductCard({ product, selected, onSelect }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const st = statusMap[product.status] || statusMap.pending

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('确定删除该商品？')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: product.id })
    }
  }

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-200 hover:border-white/15 group relative">
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(product.id)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 accent-primary cursor-pointer"
        />
      </div>

      {/* 主图缩略图 */}
      <div className="aspect-[4/3] bg-bg-alt flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0].data} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl text-txt-disabled">📷</div>
        )}
      </div>

      {/* 信息区 */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 flex-1">
            {product.name}
          </h3>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
            {st.label}
          </span>
        </div>

        {/* 类目 */}
        <span className="inline-block px-2 py-0.5 rounded bg-white/5 text-txt-secondary text-[11px] mr-1.5">
          {product.category}
        </span>

        {/* 平台标签 */}
        <div className="flex flex-wrap gap-1 mt-2">
          {(product.platforms || []).map((p) => (
            <span key={p} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${platformColors[p] || 'bg-white/10 text-txt-secondary'}`}>
              {p}
            </span>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => navigate(`/edit/${product.id}`)}
            className="flex-1 text-xs text-txt-secondary hover:text-white py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            ✏️ 编辑
          </button>
          {product.status === 'generated' ? (
            <button
              onClick={() => navigate(`/generate/${product.id}`)}
              className="flex-1 text-xs text-primary hover:text-blue-300 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
            >
              👁️ 查看
            </button>
          ) : (
            <button
              onClick={() => navigate(`/generate/${product.id}`)}
              className="flex-1 text-xs text-accent hover:text-yellow-300 py-1.5 rounded-lg hover:bg-accent/10 transition-all"
            >
              ⚡ 生成
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-txt-disabled hover:text-danger py-1.5 px-2 rounded-lg hover:bg-danger/10 transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
