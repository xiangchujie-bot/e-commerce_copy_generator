import { useState, useRef } from 'react'

export default function DraftCard({ copy, index, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const hookRef = useRef(null)
  const bulletRefs = useRef([])

  const colors = [
    { badge: 'bg-primary/15 text-primary', dot: 'bg-primary', border: 'border-primary/30', hookBg: 'bg-primary/5 border-primary/30 text-primary/80' },
    { badge: 'bg-accent/15 text-accent', dot: 'bg-accent', border: 'border-accent/30', hookBg: 'bg-accent/5 border-accent/30 text-accent/80' },
    { badge: 'bg-purple-400/15 text-purple-400', dot: 'bg-purple-400', border: 'border-purple-400/30', hookBg: 'bg-purple-400/5 border-purple-400/30 text-purple-300/80' },
  ]
  const c = colors[index % 3]

  const handleCopyAll = () => {
    const text = `${copy.title}\n${copy.subtitle}\n${copy.bullets.map((b) => '· ' + b).join('\n')}\n${copy.hook}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleSave = () => {
    const updated = {
      title: titleRef.current?.innerText || copy.title,
      subtitle: subtitleRef.current?.innerText || copy.subtitle,
      bullets: bulletRefs.current.map((ref, i) => ref?.innerText || copy.bullets[i]),
      hook: hookRef.current?.innerText || copy.hook,
    }
    onUpdate(index, updated)
    setEditing(false)
  }

  return (
    <div className="glass rounded-xl p-5 transition-all duration-300 hover:border-white/12 group">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
          方案 {index + 1}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setFavorited(!favorited)}
            className={`text-xs px-2 py-1 rounded ${favorited ? 'bg-accent/15 text-accent' : 'bg-white/5 text-txt-secondary hover:text-white'}`}
          >
            {favorited ? '⭐' : '☆'} 收藏
          </button>
          {editing ? (
            <button onClick={handleSave} className="text-xs text-success hover:text-green-300 px-2 py-1 rounded bg-success/10">
              ✓ 保存
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-txt-secondary hover:text-white px-2 py-1 rounded bg-white/5">
              ✏️ 编辑
            </button>
          )}
          <button onClick={handleCopyAll} className="text-xs text-txt-secondary hover:text-white px-2 py-1 rounded bg-white/5">
            {copied ? '✓ 已复制' : '📋 复制'}
          </button>
        </div>
      </div>

      <h4
        ref={titleRef}
        contentEditable={editing}
        suppressContentEditableWarning
        className={`text-white text-lg font-bold mb-1 outline-none ${editing ? 'bg-white/5 rounded px-2 py-1 border border-white/10' : ''}`}
      >
        {copy.title}
      </h4>
      <p
        ref={subtitleRef}
        contentEditable={editing}
        suppressContentEditableWarning
        className={`text-txt-secondary text-sm mb-3 outline-none ${editing ? 'bg-white/5 rounded px-2 py-1 border border-white/10' : ''}`}
      >
        {copy.subtitle}
      </p>

      <ul className="space-y-1.5 mb-4">
        {copy.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`}></span>
            <span
              ref={(el) => (bulletRefs.current[i] = el)}
              contentEditable={editing}
              suppressContentEditableWarning
              className={`outline-none ${editing ? 'bg-white/5 rounded px-1 border border-white/10 w-full' : ''}`}
            >
              {b}
            </span>
          </li>
        ))}
      </ul>

      <div className={`rounded-lg p-3 text-sm italic border-l-2 ${c.hookBg}`}>
        <span
          ref={hookRef}
          contentEditable={editing}
          suppressContentEditableWarning
          className={`outline-none ${editing ? 'bg-white/5 rounded px-1 border border-white/10 not-italic block' : ''}`}
        >
          「{copy.hook}」
        </span>
      </div>
    </div>
  )
}
