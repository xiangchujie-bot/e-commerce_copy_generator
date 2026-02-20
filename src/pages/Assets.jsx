import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'

const categoryTree = ['全部', '鞋靴', '箱包', '男装', '女装', '家居', '美妆', '数码', '其他']

export default function Assets() {
  const { assets } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [expandedCategories, setExpandedCategories] = useState(new Set(['全部']))

  const toggleExpand = (cat) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const filtered = selectedCategory === '全部'
    ? assets
    : assets.filter((a) => a.category === selectedCategory)

  const categoryCounts = {}
  assets.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1
  })

  const handleDelete = (id) => {
    if (confirm('确定删除该素材？')) {
      dispatch({ type: 'DELETE_ASSET', payload: id })
    }
  }

  const handleReference = (asset) => {
    navigate('/create', { state: { refAsset: asset } })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">素材库</h2>

      <div className="flex gap-6">
        {/* 左侧：树形目录 */}
        <div className="w-56 flex-shrink-0">
          <div className="glass rounded-xl p-4 sticky top-20">
            <h3 className="text-sm font-bold text-white mb-3">📁 分类目录</h3>
            <div className="space-y-0.5">
              {categoryTree.map((cat) => {
                const count = cat === '全部' ? assets.length : (categoryCounts[cat] || 0)
                const isSelected = selectedCategory === cat
                const isExpanded = expandedCategories.has(cat)
                const hasItems = count > 0

                return (
                  <div key={cat}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat)
                        if (cat !== '全部') toggleExpand(cat)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        isSelected
                          ? 'bg-primary/15 text-primary'
                          : 'text-txt-secondary hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {cat !== '全部' && (
                          <span className={`text-[10px] transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                        )}
                        {cat === '全部' && <span className="text-xs">📋</span>}
                        <span>{cat}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-txt-disabled'
                      }`}>
                        {count}
                      </span>
                    </button>

                    {/* 展开的子项（显示该类目下的素材名） */}
                    {cat !== '全部' && isExpanded && hasItems && (
                      <div className="ml-7 mt-0.5 space-y-0.5">
                        {assets
                          .filter((a) => a.category === cat)
                          .map((a) => (
                            <div
                              key={a.id}
                              className="text-[11px] text-txt-disabled hover:text-txt-secondary px-2 py-1 rounded cursor-pointer hover:bg-white/[0.02] truncate"
                              onClick={() => setSelectedCategory(cat)}
                            >
                              {a.productName}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 右侧：素材网格 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-txt-secondary text-sm">
              {selectedCategory === '全部' ? '全部素材' : selectedCategory}
              <span className="text-txt-disabled ml-2">({filtered.length} 条)</span>
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-txt-secondary">该分类下暂无素材</p>
              <p className="text-txt-disabled text-sm mt-1">在添加商品时勾选「保存到素材库」即可添加</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((asset) => (
                <div key={asset.id} className="glass rounded-xl p-4 transition-all duration-200 hover:border-white/15 group">
                  {/* 图片预览 */}
                  <div className="aspect-[3/2] rounded-lg bg-bg-alt flex items-center justify-center overflow-hidden mb-3">
                    {asset.images && asset.images.length > 0 ? (
                      <img src={asset.images[0].data} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl text-txt-disabled mb-1">🖼️</div>
                        <p className="text-txt-disabled text-[10px]">{asset.imageCount} 张图片</p>
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <h4 className="text-white text-sm font-medium mb-1 truncate">{asset.productName}</h4>
                  <div className="flex items-center justify-between text-[11px] text-txt-disabled mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-white/5">{asset.category}</span>
                      <span>{asset.imageCount} 张</span>
                    </div>
                    <span>{asset.createdAt}</span>
                  </div>

                  {/* 操作 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReference(asset)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                    >
                      📎 引用到新商品
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-xs py-1.5 px-3 rounded-lg bg-white/5 text-txt-disabled hover:text-danger hover:bg-danger/10 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
