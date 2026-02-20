import { useState } from 'react'

export default function TagInput({ tags = [], onChange, placeholder = '输入后按回车添加' }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors min-h-[42px]">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="text-primary/60 hover:text-primary ml-0.5"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent text-white text-sm placeholder-txt-disabled outline-none"
      />
    </div>
  )
}
