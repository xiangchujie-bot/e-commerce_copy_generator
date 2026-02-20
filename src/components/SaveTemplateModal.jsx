import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppDispatch } from '../context/AppContext.jsx'
import TagInput from './TagInput.jsx'

export default function SaveTemplateModal({ visible, onClose, defaultName = '', copy, style }) {
  const dispatch = useAppDispatch()
  const [name, setName] = useState(defaultName)
  const [type, setType] = useState('完整')
  const [tags, setTags] = useState([])
  const [folder, setFolder] = useState('默认')
  const [notes, setNotes] = useState('')

  const types = ['完整', '仅主图', '仅标题', '仅文案']
  const folders = ['默认', '促销', '社交', '品牌']

  const handleSave = () => {
    if (!name.trim()) return
    dispatch({
      type: 'ADD_TEMPLATE',
      payload: {
        name: name.trim(),
        type: type === '仅主图' ? '主图' : type === '仅标题' ? '标题' : type === '仅文案' ? '文案' : '完整',
        tags,
        folder,
        copy: copy || { title: '', subtitle: '', bullets: [], hook: '' },
        style: style ?? 0,
        notes,
      },
    })
    onClose()
  }

  if (!visible) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-lg font-bold mb-4">⭐ 收藏为模板</h3>

        <div className="space-y-4">
          {/* 名称 */}
          <div>
            <label className="block text-sm text-txt-secondary mb-1">模板名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入模板名称"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-txt-disabled focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* 收藏类型 */}
          <div>
            <label className="block text-sm text-txt-secondary mb-1">收藏类型</label>
            <div className="flex gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    type === t
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-txt-secondary hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm text-txt-secondary mb-1">标签</label>
            <TagInput tags={tags} onChange={setTags} placeholder="输入标签按回车" />
          </div>

          {/* 文件夹 */}
          <div>
            <label className="block text-sm text-txt-secondary mb-1">文件夹</label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
            >
              {folders.map((f) => (
                <option key={f} value={f} className="bg-bg-card">{f}</option>
              ))}
            </select>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm text-txt-secondary mb-1">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="选填"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-txt-disabled focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-txt-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 transition-all disabled:opacity-40"
          >
            确认收藏
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
