import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { generateCopies } from '../utils/copyGenerator.js'
import DraftCard from '../components/DraftCard.jsx'
import ImageCanvas from '../components/ImageCanvas.jsx'
import SaveTemplateModal from '../components/SaveTemplateModal.jsx'

export default function GenerateResult() {
  const { productId, batchId } = useParams()
  const { products } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const product = products.find((p) => p.id === productId)
  const [loading, setLoading] = useState(false)
  const [copies, setCopies] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [saveModal, setSaveModal] = useState({ visible: false, copy: null, style: null, name: '' })

  useEffect(() => {
    if (!product) return
    if (product.drafts && product.drafts.copies) {
      setCopies(product.drafts.copies)
    } else {
      handleGenerate()
    }
  }, [product?.id])

  const handleGenerate = () => {
    if (!product) return
    setLoading(true)
    setCopies(null)

    // 模拟生成延迟
    setTimeout(() => {
      const result = generateCopies(product)
      setCopies(result)
      dispatch({
        type: 'SET_PRODUCT_DRAFTS',
        payload: { id: product.id, drafts: { copies: result, images: [] } },
      })
      setLoading(false)
    }, 1500)
  }

  const handleUpdateCopy = (index, updated) => {
    const next = [...copies]
    next[index] = updated
    setCopies(next)
    dispatch({
      type: 'UPDATE_DRAFT_COPY',
      payload: { productId: product.id, index, copy: updated },
    })
  }

  const handleDownloadAll = () => {
    // 触发每个 canvas 的下载
    const canvases = document.querySelectorAll('canvas')
    canvases.forEach((canvas, i) => {
      const link = document.createElement('a')
      link.download = `主图_方案${i + 1}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    })
  }

  const handleFavorite = (styleIndex) => {
    if (!copies) return
    setSaveModal({
      visible: true,
      copy: copies[styleIndex] || copies[0],
      style: styleIndex,
      name: `${product?.name || '商品'} - 风格${styleIndex + 1}`,
    })
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-txt-secondary mb-4">未找到该商品</p>
        <button onClick={() => navigate('/')} className="text-primary hover:text-blue-300 text-sm">
          ← 返回工作台
        </button>
      </div>
    )
  }

  const firstImage = product.images?.[0]?.data || null
  const firstBullet = product.sellingPoints?.[0] || '品质保证'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-txt-secondary hover:text-white transition-colors">
          ← 返回工作台
        </button>
        <h2 className="text-xl font-bold text-white">生成结果</h2>
        <span className="text-txt-disabled text-sm">· {product.name}</span>
      </div>

      <div className="flex gap-6">
        {/* 左侧：商品信息摘要 */}
        <div className={`transition-all duration-300 ${collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-72 flex-shrink-0'}`}>
          <div className="glass rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">📦 商品信息</h3>
              <button
                onClick={() => setCollapsed(true)}
                className="text-txt-disabled hover:text-white text-xs"
              >
                收起 ◀
              </button>
            </div>

            {/* 图片 */}
            <div className="aspect-square rounded-lg bg-bg-alt flex items-center justify-center overflow-hidden mb-4">
              {firstImage ? (
                <img src={firstImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-txt-disabled">📷</span>
              )}
            </div>

            <h4 className="text-white font-medium text-sm mb-2">{product.name}</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-txt-disabled">类目</span>
                <span className="text-txt-secondary">{product.category}</span>
              </div>
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-txt-disabled">品牌</span>
                  <span className="text-txt-secondary">{product.brand}</span>
                </div>
              )}
              {product.price > 0 && (
                <div className="flex justify-between">
                  <span className="text-txt-disabled">价格</span>
                  <span className="text-accent font-mono">¥{product.price}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-txt-disabled">人群</span>
                <span className="text-txt-secondary">{product.audience}</span>
              </div>
            </div>

            {/* 平台 */}
            <div className="flex flex-wrap gap-1 mt-3">
              {(product.platforms || []).map((p) => (
                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{p}</span>
              ))}
            </div>

            {/* 卖点 */}
            {product.sellingPoints?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-txt-disabled text-[10px] mb-1.5">核心卖点</p>
                <ul className="space-y-1">
                  {product.sellingPoints.map((sp, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-txt-secondary">
                      <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></span>
                      {sp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 收起时的展开按钮 */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 text-txt-disabled hover:text-white flex items-center justify-center self-start sticky top-20"
          >
            ▶
          </button>
        )}

        {/* 右侧：结果区域 */}
        <div className="flex-1 min-w-0">
          {loading ? (
            /* 骨架屏 */
            <div className="space-y-6">
              <div>
                <h3 className="text-txt-disabled text-sm font-medium mb-3">📝 文案生成中...</h3>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-5 mb-4">
                    <div className="shimmer rounded h-7 w-3/4 mb-3"></div>
                    <div className="shimmer rounded h-5 w-1/2 mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="shimmer rounded h-4 w-full"></div>
                      <div className="shimmer rounded h-4 w-5/6"></div>
                      <div className="shimmer rounded h-4 w-4/6"></div>
                    </div>
                    <div className="shimmer rounded h-12 w-full"></div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-txt-disabled text-sm font-medium mb-3">🖼️ 主图合成中...</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer rounded-xl aspect-square"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : copies ? (
            <div className="space-y-8">
              {/* 主图草稿区 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-base font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">🖼️</span>
                      主图草稿
                    </h3>
                    <p className="text-txt-disabled text-xs mt-0.5">3 个风格变体</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <ImageCanvas
                      key={i}
                      imageBase64={firstImage}
                      name={copies[i]?.title || product.name}
                      bullet={copies[i]?.bullets?.[0] || firstBullet}
                      styleIndex={i}
                      onFavorite={() => handleFavorite(i)}
                    />
                  ))}
                </div>
              </div>

              {/* 文案草稿区 */}
              <div>
                <h3 className="text-white text-base font-bold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">📝</span>
                  文案草稿
                </h3>
                <div className="space-y-4">
                  {copies.map((copy, i) => (
                    <DraftCard key={i} copy={copy} index={i} onUpdate={handleUpdateCopy} />
                  ))}
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className="glass rounded-xl px-6 py-4 flex items-center justify-between sticky bottom-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-txt-secondary hover:text-white transition-colors"
                >
                  ← 返回工作台
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerate}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white/5 text-txt-secondary hover:bg-white/10 hover:text-white border border-white/10 transition-all"
                  >
                    🔄 重新生成
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-all"
                  >
                    📥 全部下载
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* 收藏弹窗 */}
      <SaveTemplateModal
        visible={saveModal.visible}
        onClose={() => setSaveModal({ visible: false, copy: null, style: null, name: '' })}
        defaultName={saveModal.name}
        copy={saveModal.copy}
        style={saveModal.style}
      />
    </div>
  )
}
