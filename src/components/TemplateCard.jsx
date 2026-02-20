import { useAppDispatch } from '../context/AppContext.jsx'

const typeColors = {
  '完整': 'bg-primary/15 text-primary',
  '主图': 'bg-green-500/15 text-green-400',
  '标题': 'bg-accent/15 text-accent',
  '文案': 'bg-purple-400/15 text-purple-400',
}

export default function TemplateCard({ template, onReuse, onEdit }) {
  const dispatch = useAppDispatch()

  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('确定删除该模板？')) {
      dispatch({ type: 'DELETE_TEMPLATE', payload: template.id })
    }
  }

  const isVisual = template.type === '完整' || template.type === '主图'

  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-200 hover:border-white/15 group">
      {/* 预览区 */}
      <div className="aspect-[4/3] bg-bg-alt flex items-center justify-center p-4 overflow-hidden">
        {isVisual ? (
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-bg-card to-bg-alt flex items-center justify-center border border-white/5">
            <div className="text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-txt-disabled text-xs">主图模板预览</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center gap-2 px-2">
            <p className="text-white text-sm font-medium line-clamp-2">{template.copy?.title || '标题模板'}</p>
            {template.copy?.subtitle && (
              <p className="text-txt-secondary text-xs line-clamp-1">{template.copy.subtitle}</p>
            )}
            {template.copy?.hook && (
              <p className="text-txt-disabled text-xs italic line-clamp-2 mt-1">「{template.copy.hook}」</p>
            )}
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white text-sm font-medium truncate flex-1 mr-2">{template.name}</h4>
          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded ${typeColors[template.type] || 'bg-white/10 text-txt-secondary'}`}>
            {template.type}
          </span>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(template.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-txt-disabled">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-txt-disabled mb-3">
          <span>使用 {template.usageCount} 次</span>
          <span>{template.createdAt}</span>
        </div>

        {/* 操作 */}
        <div className="flex gap-2">
          <button
            onClick={() => onReuse?.(template)}
            className="flex-1 text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            复用生成
          </button>
          <button
            onClick={() => onEdit?.(template)}
            className="text-xs py-1.5 px-2.5 rounded-lg bg-white/5 text-txt-secondary hover:text-white hover:bg-white/10 transition-all"
          >
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="text-xs py-1.5 px-2.5 rounded-lg bg-white/5 text-txt-disabled hover:text-danger hover:bg-danger/10 transition-all"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
