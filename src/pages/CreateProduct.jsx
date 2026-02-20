import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppState, useAppDispatch } from '../context/AppContext.jsx'
import TagInput from '../components/TagInput.jsx'
import FileUpload from '../components/FileUpload.jsx'

const categories = ['女装', '男装', '箱包', '鞋靴', '家居', '美妆', '数码', '其他']
const audienceOptions = ['女性', '男性', '通用', '儿童']
const platformOptions = ['淘宝', '拼多多', '抖音', '京东']

const emptyForm = {
  name: '', category: '', brand: '', material: '', size: '',
  colors: [], audience: '通用', sellingPoints: [''],
  price: '', platforms: [], images: [], refImages: [], refUrl: '',
  saveToAssets: false, notes: '',
}

export default function CreateProduct() {
  const { productId } = useParams()
  const { products } = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const isEdit = !!productId
  const existing = isEdit ? products.find((p) => p.id === productId) : null

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || '',
        category: existing.category || '',
        brand: existing.brand || '',
        material: existing.material || '',
        size: existing.size || '',
        colors: existing.colors || [],
        audience: existing.audience || '通用',
        sellingPoints: existing.sellingPoints?.length > 0 ? existing.sellingPoints : [''],
        price: existing.price ? String(existing.price) : '',
        platforms: existing.platforms || [],
        images: existing.images || [],
        refImages: existing.refImages || [],
        refUrl: '',
        saveToAssets: false,
        notes: existing.notes || '',
      })
    }
  }, [existing])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  // 卖点动态列表
  const updateSP = (idx, val) => {
    const next = [...form.sellingPoints]
    next[idx] = val
    updateField('sellingPoints', next)
  }
  const addSP = () => {
    if (form.sellingPoints.length < 5) {
      updateField('sellingPoints', [...form.sellingPoints, ''])
    }
  }
  const removeSP = (idx) => {
    if (form.sellingPoints.length > 1) {
      updateField('sellingPoints', form.sellingPoints.filter((_, i) => i !== idx))
    }
  }
  const moveSP = (idx, dir) => {
    const next = [...form.sellingPoints]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    updateField('sellingPoints', next)
  }

  const togglePlatform = (p) => {
    const next = form.platforms.includes(p)
      ? form.platforms.filter((x) => x !== p)
      : [...form.platforms, p]
    updateField('platforms', next)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '请输入商品名称'
    if (!form.category) errs.category = '请选择类目'
    if (form.platforms.length === 0) errs.platforms = '请选择至少一个平台'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = (andGenerate = false) => {
    if (!validate()) return
    const payload = {
      ...form,
      price: form.price ? Number(form.price) : 0,
      sellingPoints: form.sellingPoints.filter(Boolean),
    }

    if (isEdit) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: productId, ...payload } })
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload })
    }

    if (form.saveToAssets) {
      dispatch({
        type: 'ADD_ASSET',
        payload: {
          productName: form.name,
          category: form.category,
          imageCount: form.images.length,
          images: form.images,
        },
      })
    }

    if (andGenerate) {
      navigate(isEdit ? `/generate/${productId}` : '/')
    } else {
      navigate('/')
    }
  }

  const Label = ({ children, required, error }) => (
    <label className="block text-sm font-medium text-txt-secondary mb-1.5">
      {children}
      {required && <span className="text-danger ml-1">*</span>}
      {error && <span className="text-danger text-xs ml-2">{error}</span>}
    </label>
  )

  const inputCls = (field) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-white text-sm placeholder-txt-disabled focus:outline-none transition-colors ${
      errors[field] ? 'border-danger/50 focus:border-danger' : 'border-white/10 focus:border-primary/50'
    }`

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="text-txt-secondary hover:text-white transition-colors">
          ← 返回
        </button>
        <h2 className="text-xl font-bold text-white">{isEdit ? '编辑商品' : '添加商品'}</h2>
      </div>

      <div className="flex gap-6">
        {/* 左栏：表单 */}
        <div className="flex-1 min-w-0">
          <div className="glass rounded-2xl p-6 space-y-5">
            {/* 商品名称 */}
            <div>
              <Label required error={errors.name}>商品名称</Label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="如：超轻透气飞织运动鞋"
                  maxLength={60}
                  className={inputCls('name')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-disabled text-xs font-mono">
                  {form.name.length}/60
                </span>
              </div>
            </div>

            {/* 类目 */}
            <div>
              <Label required error={errors.category}>类目</Label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={inputCls('category')}
              >
                <option value="" className="bg-bg-card">请选择类目</option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-bg-card">{c}</option>
                ))}
              </select>
            </div>

            {/* 品牌 + 材质 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>品牌</Label>
                <input type="text" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} placeholder="品牌名称" className={inputCls()} />
              </div>
              <div>
                <Label>材质</Label>
                <input type="text" value={form.material} onChange={(e) => updateField('material', e.target.value)} placeholder="如：纯棉、真皮" className={inputCls()} />
              </div>
            </div>

            {/* 尺寸 */}
            <div>
              <Label>尺寸规格</Label>
              <input type="text" value={form.size} onChange={(e) => updateField('size', e.target.value)} placeholder="如：S-XXL / 30×25×12cm" className={inputCls()} />
            </div>

            {/* 颜色/款式 */}
            <div>
              <Label>颜色/款式</Label>
              <TagInput tags={form.colors} onChange={(v) => updateField('colors', v)} placeholder="输入颜色后按回车" />
            </div>

            {/* 适用人群 */}
            <div>
              <Label>适用人群</Label>
              <div className="flex gap-2">
                {audienceOptions.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => updateField('audience', a)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      form.audience === a
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-txt-secondary hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* 核心卖点 */}
            <div>
              <Label>核心卖点（最多5条）</Label>
              <div className="space-y-2">
                {form.sellingPoints.map((sp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-txt-disabled text-xs w-5 text-center font-mono">{i + 1}</span>
                    <input
                      type="text"
                      value={sp}
                      onChange={(e) => updateSP(i, e.target.value)}
                      placeholder={`卖点 ${i + 1}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-txt-disabled focus:outline-none focus:border-primary/50"
                    />
                    <button onClick={() => moveSP(i, -1)} disabled={i === 0} className="text-txt-disabled hover:text-white disabled:opacity-20 text-xs px-1">↑</button>
                    <button onClick={() => moveSP(i, 1)} disabled={i === form.sellingPoints.length - 1} className="text-txt-disabled hover:text-white disabled:opacity-20 text-xs px-1">↓</button>
                    <button onClick={() => removeSP(i)} disabled={form.sellingPoints.length <= 1} className="text-txt-disabled hover:text-danger disabled:opacity-20 text-xs px-1">✕</button>
                  </div>
                ))}
                {form.sellingPoints.length < 5 && (
                  <button onClick={addSP} className="text-xs text-primary hover:text-blue-300 transition-colors">
                    + 添加卖点
                  </button>
                )}
              </div>
            </div>

            {/* 价格 */}
            <div>
              <Label>价格（元）</Label>
              <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="如：99" className={inputCls()} />
            </div>

            {/* 目标平台 */}
            <div>
              <Label required error={errors.platforms}>目标平台</Label>
              <div className="flex gap-2">
                {platformOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      form.platforms.includes(p)
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-txt-secondary hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 商品图片 */}
            <div>
              <Label>商品图片</Label>
              <FileUpload images={form.images} onChange={(fn) => setForm((prev) => ({ ...prev, images: typeof fn === 'function' ? fn(prev.images) : fn }))} max={10} />
            </div>

            {/* 参考素材 */}
            <div>
              <Label>参考素材</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FileUpload images={form.refImages} onChange={(fn) => setForm((prev) => ({ ...prev, refImages: typeof fn === 'function' ? fn(prev.refImages) : fn }))} max={5} label="参考图片" />
                </div>
                <div>
                  <input
                    type="url"
                    value={form.refUrl}
                    onChange={(e) => updateField('refUrl', e.target.value)}
                    placeholder="参考链接 URL"
                    className={inputCls()}
                  />
                </div>
              </div>
            </div>

            {/* 保存到素材库 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-txt-secondary">保存到素材库</span>
              <button
                type="button"
                onClick={() => updateField('saveToAssets', !form.saveToAssets)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.saveToAssets ? 'bg-primary' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.saveToAssets ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* 备注 */}
            <div>
              <Label>备注</Label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="其他补充说明（选填）"
                rows={2}
                className={`${inputCls()} resize-none`}
              />
            </div>

            {/* 按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSave(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-txt-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                💾 保存草稿
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                ⚡ 立即生成
              </button>
            </div>
          </div>
        </div>

        {/* 右栏：实时预览 */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <div className="glass rounded-2xl p-5 sticky top-20">
            <h3 className="text-sm font-bold text-white mb-4">📋 信息预览</h3>

            <div className="space-y-3">
              {/* 图片预览 */}
              <div className="aspect-[4/3] rounded-lg bg-bg-alt flex items-center justify-center overflow-hidden">
                {form.images.length > 0 ? (
                  <img src={form.images[0].data} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-txt-disabled">📷</span>
                )}
              </div>

              <div>
                <p className="text-white font-medium text-sm">{form.name || '商品名称'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {form.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-txt-secondary">{form.category}</span>}
                  {form.brand && <span className="text-[10px] text-txt-disabled">{form.brand}</span>}
                </div>
              </div>

              {form.price && (
                <p className="text-accent font-bold font-mono">¥{form.price}</p>
              )}

              {form.sellingPoints.filter(Boolean).length > 0 && (
                <div>
                  <p className="text-txt-disabled text-[10px] mb-1">核心卖点</p>
                  <ul className="space-y-1">
                    {form.sellingPoints.filter(Boolean).map((sp, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-txt-secondary">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></span>
                        {sp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {form.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.platforms.map((p) => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{p}</span>
                  ))}
                </div>
              )}

              {form.colors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.colors.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-txt-disabled">{c}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
