import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import TemplateCard from '../components/TemplateCard.jsx'

const typeFilters = ['全部', '完整', '主图', '标题', '文案']
const allTags = ['白底', '简约', '通用', '促销', '大字', '拼多多', '高端', '质感', '淘宝', '种草', '抖音', '小红书风', '场景', '生活', '女装']

export default function Library() {
  const { templates, products } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [selectedTags, setSelectedTags] = useState([])
  const [folderFilter, setFolderFilter] = useState('全部')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [reuseTemplate, setReuseTemplate] = useState(null)
  const [quickName, setQuickName] = useState('')
  const [quickCategory, setQuickCategory] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')

  const folders = ['全部', ...new Set(templates.map((t) => t.folder).filter(Boolean))]

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const filtered = templates.filter((t) => {
    if (search && !t.name.includes(search) && !(t.tags || []).some((tag) => tag.includes(search))) return false
    if (typeFilter !== '全部' && t.type !== typeFilter) return false
    if (selectedTags.length > 0 && !selectedTags.some((st) => (t.tags || []).includes(st))) return false
    if (folderFilter !== '全部' && t.folder !== folderFilter) return false
    return true
  })

  const handleReuse = (template) => {
    setReuseTemplate(template)
    setDrawerVisible(true)
    setQuickName('')
    setQuickCategory('')
    setSelectedProductId('')
  }

  const handleReuseConfirm = () => {
    if (selectedProductId) {
      navigate(`/generate/${selectedProductId}`)
    } else if (quickName.trim()) {
      dispatch({
        type: 'ADD_PRODUCT',
        payload: {
          name: quickName.trim(),
          category: quickCategory || '其他',
          brand: '',
          material: '',
          size: '',
          colors: [],
          audience: '通用',
          sellingPoints: [],
          price: 0,
          platforms: ['淘宝'],
          images: [],
          refImages: [],
          notes: `基于模板「${reuseTemplate?.name}」生成`,
        },
      })
      navigate('/')
    }
    setDrawerVisible(false)
  }

  const handleEdit = (template) => {
    // 简单实现：弹出提示
    const newName = prompt('修改模板名称：', template.name)
    if (newName && newName !== template.name) {
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { id: template.id, name: newName } })
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">模板库</h2>

      {/* 搜索 + 筛选 */}
      <div className="glass rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模板名称或标签..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-txt-disabled focus:outline-none focus:border-primary/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-disabled text-sm">🔍</span>
          </div>

          {/* 文件夹 */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
          >
            {folders.map((f) => (
              <option key={f} value={f} className="bg-bg-card">{f === '全部' ? '📁 全部文件夹' : `📁 ${f}`}</option>
            ))}
          </select>
        </div>

        {/* 类型筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-txt-disabled text-xs mr-1">类型：</span>
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                typeFilter === t
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-txt-secondary hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 标签筛选 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-txt-disabled text-xs mr-1 flex-shrink-0">标签：</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-accent/15 text-accent'
                  : 'bg-white/5 text-txt-disabled hover:text-txt-secondary'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="flex-shrink-0 text-[11px] text-txt-disabled hover:text-white ml-1"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* 模板网格 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-txt-secondary">没有找到匹配的模板</p>
          <p className="text-txt-disabled text-sm mt-1">尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onReuse={handleReuse}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* 复用生成 Drawer */}
      {drawerVisible && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerVisible(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-bg-card border-l border-white/5 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">复用模板生成</h3>
              <button onClick={() => setDrawerVisible(false)} className="text-txt-disabled hover:text-white text-lg">✕</button>
            </div>

            <p className="text-txt-secondary text-sm mb-4">
              模板：<span className="text-white">{reuseTemplate?.name}</span>
            </p>

            {/* 选择已有商品 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-2">选择工作台中的商品</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      selectedProductId === p.id ? 'bg-primary/10 border border-primary/30' : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="product"
                      checked={selectedProductId === p.id}
                      onChange={() => { setSelectedProductId(p.id); setQuickName('') }}
                      className="accent-primary"
                    />
                    <div>
                      <p className="text-white text-sm">{p.name}</p>
                      <p className="text-txt-disabled text-[10px]">{p.category}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-txt-disabled text-xs">或</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            {/* 快速填写 */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-white">快速填写新商品</h4>
              <input
                type="text"
                value={quickName}
                onChange={(e) => { setQuickName(e.target.value); setSelectedProductId('') }}
                placeholder="商品名称"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-txt-disabled focus:outline-none focus:border-primary/50"
              />
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="" className="bg-bg-card">选择类目</option>
                {['女装', '男装', '箱包', '鞋靴', '家居', '美妆', '数码', '其他'].map((c) => (
                  <option key={c} value={c} className="bg-bg-card">{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReuseConfirm}
              disabled={!selectedProductId && !quickName.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 transition-all disabled:opacity-30"
            >
              确认生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
