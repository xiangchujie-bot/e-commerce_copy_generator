import { useRef, useEffect, useState } from 'react'
import { composeToCanvas } from '../utils/canvasCompose.js'

const styleLabels = ['白底简约', '渐变质感', '蒙层居中']

export default function ImageCanvas({ imageBase64, name, bullet, styleIndex, onFavorite }) {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setLoading(true)
    composeToCanvas(canvasRef.current, imageBase64, name, bullet, styleIndex).then(() => {
      setLoading(false)
    })
  }, [imageBase64, name, bullet, styleIndex])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `主图_${styleLabels[styleIndex]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleFavorite = () => {
    setFavorited(!favorited)
    if (onFavorite) onFavorite(styleIndex)
  }

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-200 hover:border-white/15 group">
      <div className="relative aspect-square bg-bg-alt">
        {loading && (
          <div className="absolute inset-0 shimmer rounded-t-xl z-10" />
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
            {styleLabels[styleIndex]}
          </span>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <span className="text-txt-disabled text-xs font-mono">800 × 800</span>
        <div className="flex gap-1.5">
          <button
            onClick={handleFavorite}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all duration-200 ${
              favorited ? 'bg-accent/15 text-accent' : 'bg-white/5 text-txt-secondary hover:text-white hover:bg-white/10'
            }`}
          >
            {favorited ? '⭐' : '☆'} 收藏模板
          </button>
          <button
            onClick={handleDownload}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-txt-secondary hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            📥 下载
          </button>
        </div>
      </div>
    </div>
  )
}
