import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import { generateCopies, generateCopiesAI } from '../utils/copyGenerator.js'
import { isAIConfigured, generateImages, generateImage } from '../utils/aiApi.js'
import DraftCard from '../components/DraftCard.jsx'
import ImageCanvas from '../components/ImageCanvas.jsx'
import AIImageCard from '../components/AIImageCard.jsx'
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
  const [genSource, setGenSource] = useState(null)
  const [genError, setGenError] = useState(null)
  const [aiImages, setAiImages] = useState([null, null, null])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [saveModal, setSaveModal] = useState({ visible: false, copy: null, style: null, name: '' })

  useEffect(() => {
    if (!product) return
    if (product.drafts && product.drafts.copies) {
      setCopies(product.drafts.copies)
    } else {
      handleGenerate()
    }
  }, [product?.id])

  const handleGenerate = async () => {
    if (!product) return
    setLoading(true)
    setCopies(null)
    setGenSource(null)
    setGenError(null)
    setAiImages([null, null, null])

    let result
    try {
      const { copies: aiResult, source, error } = await generateCopiesAI(product)
      result = aiResult
      setCopies(result)
      setGenSource(source)
      if (error) setGenError(error)
      dispatch({
        type: 'SET_PRODUCT_DRAFTS',
        payload: { id: product.id, drafts: { copies: result, images: [] } },
      })
    } catch (err) {
      result = generateCopies(product)
      setCopies(result)
      setGenSource('template')
      setGenError(err.message)
      dispatch({
        type: 'SET_PRODUCT_DRAFTS',
        payload: { id: product.id, drafts: { copies: result, images: [] } },
      })
    } finally {
      setLoading(false)
    }

    // 文案生成完成后，异步启动 AI 主图生成
    if (isAIConfigured() && result) {
      setImagesLoading(true)
      try {
        const imgs = await generateImages(product, result)
        setAiImages(imgs)
      } catch (e) {
        console.error('AI 主图生成失败:', e)
      } finally {
        setImagesLoading(false)
      }
    }
  }

  const handleRetryImage = async (styleIndex) => {
    const updated = [...aiImages]
    updated[styleIndex] = { url: null, style: styleIndex, error: null }
    setAiImages(updated)
    try {
      const url = await generateImage(product, copies?.[styleIndex], styleIndex)
      updated[styleIndex] = { url, style: styleIndex, error: null }
    } catch (err) {
      updated[styleIndex] = { url: null, style: styleIndex, error: err.message }
    }
    setAiImages([...updated])
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

  const handleDownloadAll = async () => {
    // AI 图片下载
    const hasAiImages = aiImages.some((img) => img?.url)
    if (hasAiImages) {
      for (let i = 0; i < aiImages.length; i++) {
        if (aiImages[i]?.url) {
          try {
            const res = await fetch(aiImages[i].url)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = `AI主图_方案${i + 1}.png`
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
          } catch {
            window.open(aiImages[i].url, '_blank')
          }
        }
      }
    }
    // Canvas 图片下载
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
              {/* 生成来源提示 */}
              {genSource && (
                <div className={`mb-4 px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  genSource === 'ai'
                    ? 'border-green-500/30 bg-green-500/[0.05] text-green-400'
                    : 'border-yellow-500/30 bg-yellow-500/[0.05] text-yellow-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{genSource === 'ai' ? '🤖' : '📝'}</span>
                    <span className="font-medium">
                      {genSource === 'ai' ? 'AI 智能生成（SiliconFlow VLM）' : '模板规则生成'}
                    </span>
                    {genError && <span className="text-txt-disabled ml-2">· 回退原因：{genError}</span>}
                  </div>
                  {genSource === 'template' && isAIConfigured() && (
                    <button onClick={handleGenerate} className="text-primary hover:text-blue-300 text-[11px]">
                      🔄 重试 AI 生成
                    </button>
                  )}
                </div>
              )}

              {/* 关键词标签（AI 生成时才有） */}
              {genSource === 'ai' && copies?.[0]?.keywords?.length > 0 && (
                <div className="mb-4 glass rounded-xl p-4">
                  <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-1.5">
                    <span>🏷️</span> AI 提取关键词
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[...new Set(copies.flatMap((c) => c.keywords || []))].map((kw, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 主图草稿区 */}
              {isAIConfigured() && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white text-base font-bold flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-xs">🤖</span>
                        AI 生成主图
                      </h3>
                      <p className="text-txt-disabled text-xs mt-0.5">3 种风格：白底简约 / 场景生活 / 促销海报</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <AIImageCard
                        key={i}
                        imageUrl={aiImages[i]?.url || null}
                        styleIndex={i}
                        loading={imagesLoading && !aiImages[i]?.url && !aiImages[i]?.error}
                        error={aiImages[i]?.error || null}
                        onFavorite={() => handleFavorite(i)}
                        onRetry={handleRetryImage}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Canvas 合成主图（备用 / 无 AI 时显示） */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-base font-bold flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-xs">🖼️</span>
                      {isAIConfigured() ? '模板合成主图' : '主图草稿'}
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
