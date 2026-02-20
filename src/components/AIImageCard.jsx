import { useState } from 'react'

const styleLabels = ['白底简约', '场景生活', '促销海报']

export default function AIImageCard({ imageUrl, styleIndex, loading, error, onFavorite, onRetry }) {
  const [favorited, setFavorited] = useState(false)

  const handleDownload = async () => {
    if (!imageUrl) return
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `AI主图_${styleLabels[styleIndex]}.png`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      // 如果 fetch 失败，直接用 URL 打开
      window.open(imageUrl, '_blank')
    }
  }

  const handleFavorite = () => {
    setFavorited(!favorited)
    if (onFavorite) onFavorite(styleIndex)
  }

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-200 hover:border-white/15 group">
      <div className="relative aspect-square bg-bg-alt">
        {/* 加载中 */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="shimmer absolute inset-0 rounded-t-xl" />
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-txt-disabled text-xs">AI 生成中...</p>
              <p className="text-txt-disabled text-[10px] mt-1">{styleLabels[styleIndex]}风格</p>
            </div>
          </div>
        )}

        {/* 生成失败 */}
        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-alt">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="text-txt-disabled text-xs mb-1">生成失败</p>
            <p className="text-txt-disabled text-[10px] px-4 text-center mb-3 max-w-[200px] truncate">{error}</p>
            {onRetry && (
              <button
                onClick={() => onRetry(styleIndex)}
                className="text-[11px] px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-all"
              >
                🔄 重试
              </button>
            )}
          </div>
        )}

        {/* 生成成功 */}
        {!loading && !error && imageUrl && (
          <img
            src={imageUrl}
            alt={`AI主图 - ${styleLabels[styleIndex]}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* 风格标签 */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1">
            🤖 {styleLabels[styleIndex]}
          </span>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between">
        <span className="text-txt-disabled text-xs font-mono">1024 × 1024</span>
        <div className="flex gap-1.5">
          <button
            onClick={handleFavorite}
            disabled={!imageUrl}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-30 ${
              favorited ? 'bg-accent/15 text-accent' : 'bg-white/5 text-txt-secondary hover:text-white hover:bg-white/10'
            }`}
          >
            {favorited ? '⭐' : '☆'} 收藏
          </button>
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-txt-secondary hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-30"
          >
            📥 下载
          </button>
        </div>
      </div>
    </div>
  )
}
