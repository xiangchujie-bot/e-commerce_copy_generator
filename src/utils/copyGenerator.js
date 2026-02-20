import { generateWithAI, isAIConfigured } from './aiApi.js'

/**
 * 文案生成逻辑
 * - 优先使用 AI（SiliconFlow VLM）生成
 * - AI 不可用或失败时回退到模板拼接
 *
 * 输入：商品字段对象
 * 输出：3组文案对象 { title, subtitle, bullets, hook, keywords? }
 */

/**
 * AI 生成文案（异步）
 * 成功返回 AI 结果，失败回退到模板
 */
export async function generateCopiesAI(product) {
  if (!isAIConfigured()) {
    console.warn('AI 未配置，使用模板生成')
    return { copies: generateCopies(product), source: 'template' }
  }

  try {
    const copies = await generateWithAI(product)
    return { copies, source: 'ai' }
  } catch (err) {
    console.error('AI 生成失败，回退到模板:', err.message)
    return { copies: generateCopies(product), source: 'template', error: err.message }
  }
}

const titleTemplates = [
  [
    (p) => `${p.brand || ''} ${p.name} 必入好物`.trim(),
    (p) => `${p.material || '优质'}材质 ${p.audience === '女性' ? '她' : p.audience === '男性' ? '他' : ''}的品质之选`,
    (p) => `限时特惠 ${p.price ? p.price + '元' : '超值价'}起`,
  ],
  [
    (p) => `${p.sellingPoints?.[0] || '品质升级'} ${p.name}`,
    (p) => `${p.category || '好物'}界的天花板`,
    (p) => `${p.audience === '女性' ? '姐妹们' : p.audience === '男性' ? '兄弟们' : '朋友们'}冲！${p.price ? '只要' + p.price + '元' : '超值入手'}`,
  ],
  [
    (p) => `${p.name} ${p.sellingPoints?.[0] || ''}`.trim(),
    (p) => `${p.brand || '品牌'} | ${p.category || '精选'}系列`,
    (p) => `${p.platforms?.[0] || '全平台'}爆款 ${p.price ? p.price + '元' : ''}拿下`.trim(),
  ],
]

const subtitleTemplates = [
  (p) => `${p.brand || p.category || '品质'}之选 不容错过`,
  (p) => `${p.material || '优质'}工艺 ${p.audience === '通用' ? '全民' : p.audience || ''}必备`,
  (p) => `${p.category || '好物'}推荐 闭眼入`,
]

const hookTemplates = [
  (p) => `${p.audience === '女性' ? '姐妹们' : p.audience === '男性' ? '兄弟们' : '朋友们'}看过来！这款${p.name}真的绝了，${p.sellingPoints?.[0] || '品质超好'}，${p.price ? '只要' + p.price + '元' : '超值价格'}，错过真的会后悔！`,
  (p) => `全网都在抢的${p.category || '好物'}来了！${p.brand ? p.brand + '出品，' : ''}${p.sellingPoints?.[1] || '品质保证'}，${p.platforms?.[0] || ''}爆款直降，手慢无！`,
  (p) => `${p.price ? p.price + '元' : '超值价'}就能拥有的${p.material || '高品质'}${p.category || '好物'}，${p.sellingPoints?.[0] || '体验升级'}，${p.audience === '女性' ? '小姐姐' : p.audience === '男性' ? '型男' : '潮人'}们都在入手！`,
]

export function generateCopies(product) {
  const p = product || {}
  const sp = p.sellingPoints || []

  const copies = [0, 1, 2].map((i) => {
    const bullets = sp.length > 0
      ? sp.slice(0, 5)
      : ['品质保证', '超值价格', '快速发货', '售后无忧', '好评如潮']

    // 每组用不同的标题模板
    const titleIdx = i % titleTemplates.length
    const title = titleTemplates[titleIdx][i]?.(p) || `${p.name || '商品'} 方案${i + 1}`

    return {
      title,
      subtitle: subtitleTemplates[i]?.(p) || `品质好物 值得拥有`,
      bullets,
      hook: hookTemplates[i]?.(p) || `超值好物，限时特惠！`,
    }
  })

  return copies
}
