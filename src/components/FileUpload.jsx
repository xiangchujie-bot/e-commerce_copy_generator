import { useRef, useState } from 'react'

export default function FileUpload({ images = [], onChange, max = 10, label = '商品图片' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = (files) => {
    const remaining = max - images.length
    if (remaining <= 0) return
    const toAdd = Array.from(files).slice(0, remaining)

    toAdd.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange((prev) => [...prev, { name: file.name, data: e.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const removeImage = (idx) => {
    onChange((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
        className="hidden"
      />
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        className={`cursor-pointer border-2 border-dashed rounded-xl py-6 text-center transition-all duration-200 ${
          dragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-white/10 text-txt-secondary hover:border-white/20 hover:text-txt-secondary'
        }`}
      >
        <div className="text-2xl mb-1">📁</div>
        <p className="text-sm">点击或拖拽上传{label}</p>
        <p className="text-xs text-txt-disabled mt-1">
          已上传 {images.length}/{max} 张
        </p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10"
            >
              <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
