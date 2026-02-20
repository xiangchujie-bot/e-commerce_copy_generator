import { createContext, useContext, useReducer } from 'react'
import { getProductImages } from '../utils/placeholderImages.js'

const AppContext = createContext(null)
const DispatchContext = createContext(null)

// ─── Mock Data ───
const mockProducts = [
  {
    id: 'p1',
    name: '超轻透气飞织运动鞋',
    category: '鞋靴',
    brand: 'AirStep',
    material: '飞织网面',
    size: '36-44码',
    colors: ['黑色', '白色', '灰蓝'],
    audience: '女性',
    sellingPoints: ['透气不捂脚', '底部防滑耐磨', '轻量仅180g', '3D立体包裹', '可机洗'],
    price: 99,
    platforms: ['淘宝', '抖音'],
    images: getProductImages('shoes'),
    refImages: [],
    notes: '',
    status: 'pending',
    drafts: null,
    createdAt: '2026-02-15',
  },
  {
    id: 'p2',
    name: '真皮极简通勤手提包',
    category: '箱包',
    brand: 'MUJI风格',
    material: '头层牛皮',
    size: '30×25×12cm',
    colors: ['焦糖色', '黑色', '奶白'],
    audience: '女性',
    sellingPoints: ['头层牛皮', '大容量多隔层', '百搭通勤', '五金不褪色'],
    price: 299,
    platforms: ['淘宝', '京东'],
    images: getProductImages('bag'),
    refImages: [],
    notes: '主打轻奢质感',
    status: 'pending',
    drafts: null,
    createdAt: '2026-02-16',
  },
  {
    id: 'p3',
    name: '男士冰丝速干POLO衫',
    category: '男装',
    brand: 'CoolMax',
    material: '冰丝面料',
    size: 'M-3XL',
    colors: ['藏青', '白色', '浅灰', '墨绿'],
    audience: '男性',
    sellingPoints: ['冰丝凉感面料', '速干不粘身', '免烫抗皱', '商务休闲两穿'],
    price: 79,
    platforms: ['拼多多', '抖音'],
    images: getProductImages('polo'),
    refImages: [],
    notes: '',
    status: 'generated',
    drafts: {
      copies: [
        { title: '冰感降温 清爽一夏', subtitle: '冰丝POLO 商务百搭', bullets: ['冰丝凉感面料', '速干不粘身', '免烫抗皱', '商务休闲两穿', 'M-3XL全码'], hook: '这个夏天，告别闷热，穿上就凉3°C的POLO衫来了！' },
        { title: '型男必备 冰爽POLO', subtitle: '速干面料 告别闷汗', bullets: ['冰丝科技面料', '3秒速干', '抗皱免烫', '修身不紧绷', '4色可选'], hook: '上班通勤、周末出行，一件搞定所有场合！' },
        { title: '会呼吸的POLO衫', subtitle: 'CoolMax冰丝系列', bullets: ['冰感降温3°C', '透气速干', '免烫易打理', '弹力修身', '多色百搭'], hook: '79元穿出高级感，回头率飙升的秘密武器！' },
      ],
      images: [],
    },
    createdAt: '2026-02-14',
  },
  {
    id: 'p4',
    name: '无线蓝牙降噪耳机',
    category: '数码',
    brand: 'SoundPro',
    material: 'ABS+蛋白皮',
    size: '头戴式',
    colors: ['星空黑', '云雾白'],
    audience: '通用',
    sellingPoints: ['40dB主动降噪', '60小时续航', '蓝牙5.3', 'Hi-Res认证'],
    price: 199,
    platforms: ['淘宝', '京东', '抖音'],
    images: getProductImages('headphone'),
    refImages: [],
    notes: '',
    status: 'pending',
    drafts: null,
    createdAt: '2026-02-17',
  },
]

const mockTemplates = [
  {
    id: 't1',
    name: '简约白底爆款模板',
    type: '完整',
    tags: ['白底', '简约', '通用'],
    folder: '默认',
    usageCount: 23,
    copy: { title: '{name} 必入好物', subtitle: '{brand}品质之选', bullets: ['{sp1}', '{sp2}', '{sp3}'], hook: '限时特惠，错过再等一年！' },
    style: 0,
    createdAt: '2026-01-20',
  },
  {
    id: 't2',
    name: '促销大字报模板',
    type: '完整',
    tags: ['促销', '大字', '拼多多'],
    folder: '促销',
    usageCount: 45,
    copy: { title: '疯狂特价 {price}元', subtitle: '限时抢购 手慢无', bullets: ['{sp1}', '{sp2}', '{sp3}'], hook: '全网最低价，直降50%！' },
    style: 1,
    createdAt: '2026-01-25',
  },
  {
    id: 't3',
    name: '高端质感标题模板',
    type: '标题',
    tags: ['高端', '质感', '淘宝'],
    folder: '默认',
    usageCount: 12,
    copy: { title: '{brand} | {name}', subtitle: '品质生活 从此开始', bullets: [], hook: '' },
    style: 2,
    createdAt: '2026-02-01',
  },
  {
    id: 't4',
    name: '种草文案模板',
    type: '文案',
    tags: ['种草', '抖音', '小红书风'],
    folder: '社交',
    usageCount: 67,
    copy: { title: '姐妹们冲！{name}', subtitle: '用过都说好', bullets: ['{sp1}', '{sp2}', '{sp3}', '{sp4}'], hook: '闭眼入！{audience}必备的{category}，{price}元拿下！' },
    style: 0,
    createdAt: '2026-02-05',
  },
  {
    id: 't5',
    name: '场景生活主图模板',
    type: '主图',
    tags: ['场景', '生活', '女装'],
    folder: '默认',
    usageCount: 31,
    copy: { title: '', subtitle: '', bullets: [], hook: '' },
    style: 1,
    createdAt: '2026-02-10',
  },
]

const mockAssets = [
  { id: 'a1', productName: '超轻透气飞织运动鞋', category: '鞋靴', imageCount: 3, images: getProductImages('shoes'), createdAt: '2026-02-15' },
  { id: 'a2', productName: '真皮极简通勤手提包', category: '箱包', imageCount: 2, images: getProductImages('bag'), createdAt: '2026-02-16' },
  { id: 'a3', productName: '男士冰丝速干POLO衫', category: '男装', imageCount: 4, images: getProductImages('polo'), createdAt: '2026-02-14' },
  { id: 'a4', productName: '无线蓝牙降噪耳机', category: '数码', imageCount: 2, images: getProductImages('headphone'), createdAt: '2026-02-17' },
  { id: 'a5', productName: '日式陶瓷餐具套装', category: '家居', imageCount: 5, images: getProductImages('tableware'), createdAt: '2026-02-12' },
]

const initialState = {
  products: mockProducts,
  templates: mockTemplates,
  assets: mockAssets,
  nextId: 100,
}

// ─── Reducer ───
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, { ...action.payload, id: `p${state.nextId}`, status: 'pending', drafts: null, createdAt: new Date().toISOString().slice(0, 10) }],
        nextId: state.nextId + 1,
      }
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)),
      }
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      }
    case 'ADD_PRODUCTS_BATCH':
      return {
        ...state,
        products: [
          ...state.products,
          ...action.payload.map((p, i) => ({
            ...p,
            id: `p${state.nextId + i}`,
            status: 'pending',
            drafts: null,
            createdAt: new Date().toISOString().slice(0, 10),
          })),
        ],
        nextId: state.nextId + action.payload.length,
      }
    case 'SET_PRODUCT_DRAFTS':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? { ...p, status: 'generated', drafts: action.payload.drafts } : p
        ),
      }
    case 'UPDATE_DRAFT_COPY':
      return {
        ...state,
        products: state.products.map((p) => {
          if (p.id !== action.payload.productId || !p.drafts) return p
          const newCopies = [...p.drafts.copies]
          newCopies[action.payload.index] = action.payload.copy
          return { ...p, drafts: { ...p.drafts, copies: newCopies } }
        }),
      }
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, { ...action.payload, id: `t${state.nextId}`, usageCount: 0, createdAt: new Date().toISOString().slice(0, 10) }],
        nextId: state.nextId + 1,
      }
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.payload),
      }
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map((t) => (t.id === action.payload.id ? { ...t, ...action.payload } : t)),
      }
    case 'ADD_ASSET':
      return {
        ...state,
        assets: [...state.assets, { ...action.payload, id: `a${state.nextId}`, createdAt: new Date().toISOString().slice(0, 10) }],
        nextId: state.nextId + 1,
      }
    case 'DELETE_ASSET':
      return {
        ...state,
        assets: state.assets.filter((a) => a.id !== action.payload),
      }
    default:
      return state
  }
}

// ─── Provider ───
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}

export function useAppDispatch() {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider')
  return ctx
}
