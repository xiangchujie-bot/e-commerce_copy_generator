/**
 * SiliconFlow VLM API 封装
 * 使用 Qwen2.5-VL 视觉语言模型，根据商品图片+信息生成电商文案
 */

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY || ''
const VLM_MODEL = 'Pro/Qwen/Qwen2.5-VL-7B-Instruct'
const LLM_MODEL = 'Pro/Qwen/Qwen2.5-7B-Instruct'

/**
 * 调用 SiliconFlow Chat Completions API
 */
async function callSiliconFlow(messages, model = LLM_MODEL) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
      temperature: 0.8,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 请求失败 (${res.status}): ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * 构建商品信息摘要文本
 */
function buildProductSummary(product) {
  const parts = []
  if (product.name) parts.push(`商品名称：${product.name}`)
  if (product.category) parts.push(`类目：${product.category}`)
  if (product.brand) parts.push(`品牌：${product.brand}`)
  if (product.material) parts.push(`材质：${product.material}`)
  if (product.size) parts.push(`尺寸规格：${product.size}`)
  if (product.colors?.length) parts.push(`颜色：${product.colors.join('、')}`)
  if (product.audience) parts.push(`适用人群：${product.audience}`)
  if (product.price) parts.push(`价格：${product.price}元`)
  if (product.platforms?.length) parts.push(`目标平台：${product.platforms.join('、')}`)
  if (product.sellingPoints?.length) parts.push(`已有卖点：${product.sellingPoints.join('、')}`)
  if (product.notes) parts.push(`备注：${product.notes}`)
  return parts.join('\n')
}

const SYSTEM_PROMPT = `你是一位资深电商运营文案专家，擅长为商品撰写高转化率的标题、卖点文案和营销话术。
你需要根据商品信息（和图片，如果有的话）生成3组不同风格的电商文案。

请严格按照以下 JSON 格式输出，不要输出任何其他内容：
[
  {
    "title": "主标题（10-20字，含核心关键词，吸引点击）",
    "subtitle": "副标题（8-15字，补充卖点或场景）",
    "bullets": ["卖点1", "卖点2", "卖点3", "卖点4", "卖点5"],
    "hook": "营销钩子文案（30-60字，制造紧迫感或共鸣，适合详情页首屏或短视频开头）",
    "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
  },
  { ... },
  { ... }
]

要求：
1. 第1组：偏理性种草风格，突出产品功能和材质优势
2. 第2组：偏感性营销风格，突出使用场景和情感共鸣
3. 第3组：偏促销转化风格，突出性价比和限时优惠感
4. 每组的 bullets 必须有5条，简洁有力（每条3-8字）
5. keywords 是搜索关键词，用于SEO优化
6. 文案要符合目标平台的调性（淘宝偏专业、抖音偏口语、拼多多偏实惠）
7. 只输出 JSON，不要有任何解释文字`

/**
 * 使用 VLM（视觉语言模型）根据图片+商品信息生成文案
 * @param {Object} product - 商品对象
 * @returns {Promise<Array>} 3组文案
 */
export async function generateWithAI(product) {
  if (!API_KEY) {
    throw new Error('未配置 API Key，请在 .env 文件中设置 VITE_SILICONFLOW_API_KEY')
  }

  const summary = buildProductSummary(product)
  const hasImage = product.images?.length > 0 && product.images[0]?.data

  let messages
  if (hasImage) {
    // 使用 VLM 模型，发送图片 + 文本
    const imageData = product.images[0].data
    // 如果是 data URI，提取 base64 部分；如果已经是 URL 则直接用
    const imageUrl = imageData.startsWith('data:') ? imageData : imageData

    messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `请根据这张商品图片和以下商品信息，生成3组电商文案：\n\n${summary}`,
          },
        ],
      },
    ]

    try {
      const raw = await callSiliconFlow(messages, VLM_MODEL)
      return parseAIResponse(raw, product)
    } catch (vlmErr) {
      console.warn('VLM 调用失败，回退到纯文本模型:', vlmErr.message)
      // 回退到纯文本模型
    }
  }

  // 纯文本模型（无图片或 VLM 失败时）
  messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `请根据以下商品信息生成3组电商文案：\n\n${summary}`,
    },
  ]

  const raw = await callSiliconFlow(messages, LLM_MODEL)
  return parseAIResponse(raw, product)
}

/**
 * 解析 AI 返回的 JSON 文案
 */
function parseAIResponse(raw, product) {
  // 尝试从返回内容中提取 JSON
  let jsonStr = raw.trim()

  // 处理 markdown 代码块包裹
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  // 尝试找到 JSON 数组
  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    jsonStr = arrayMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)
    if (Array.isArray(parsed) && parsed.length >= 1) {
      // 确保返回3组，不足则补充
      while (parsed.length < 3) {
        parsed.push({ ...parsed[0] })
      }
      // 标准化每组数据
      return parsed.slice(0, 3).map((item) => ({
        title: item.title || product.name || '商品标题',
        subtitle: item.subtitle || '品质之选',
        bullets: Array.isArray(item.bullets) ? item.bullets.slice(0, 5) : ['品质保证'],
        hook: item.hook || '超值好物，限时特惠！',
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
      }))
    }
  } catch (e) {
    console.error('AI 返回解析失败:', e, '\n原始内容:', raw)
  }

  throw new Error('AI 返回格式异常，无法解析')
}

// ─── 文生图 API ───
const IMAGE_API_URL = 'https://api.siliconflow.cn/v1/images/generations'
const IMAGE_MODEL = 'Kwai-Kolors/Kolors'

/**
 * 构建电商主图的英文 prompt
 */
function buildImagePrompt(product, copy, styleIndex = 0) {
  const name = product.name || 'product'
  const category = product.category || ''
  const material = product.material || ''
  const color = product.colors?.[0] || ''

  const styles = [
    `Professional e-commerce product photo of ${name}, ${category}, ${material} ${color}, clean white background, studio lighting, high resolution, minimalist style, commercial photography, product showcase, 4K quality`,
    `Lifestyle product photo of ${name}, ${category}, ${material} ${color}, natural setting, warm ambient lighting, cozy atmosphere, editorial style, magazine quality, soft shadows, 4K`,
    `Bold promotional poster for ${name}, ${category}, ${material} ${color}, vibrant colors, dynamic composition, eye-catching design, modern graphic style, sale banner aesthetic, professional marketing material, 4K`,
  ]

  return styles[styleIndex % styles.length]
}

/**
 * 调用 SiliconFlow 图片生成 API
 * @param {Object} product - 商品对象
 * @param {Object} copy - 文案对象
 * @param {number} styleIndex - 风格索引 (0/1/2)
 * @returns {Promise<string>} 生成的图片 URL
 */
export async function generateImage(product, copy, styleIndex = 0) {
  if (!API_KEY) throw new Error('未配置 API Key')

  const prompt = buildImagePrompt(product, copy, styleIndex)

  const res = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      image_size: '1024x1024',
      batch_size: 1,
      num_inference_steps: 20,
      guidance_scale: 7.5,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`图片生成失败 (${res.status}): ${err}`)
  }

  const data = await res.json()
  const url = data.images?.[0]?.url
  if (!url) throw new Error('图片生成返回为空')
  return url
}

/**
 * 批量生成3张不同风格的主图
 * @returns {Promise<Array<{url: string|null, style: number, error: string|null}>>}
 */
export async function generateImages(product, copies) {
  const tasks = [0, 1, 2].map(async (i) => {
    try {
      const url = await generateImage(product, copies?.[i], i)
      return { url, style: i, error: null }
    } catch (err) {
      console.error(`主图风格${i + 1}生成失败:`, err.message)
      return { url: null, style: i, error: err.message }
    }
  })
  return Promise.all(tasks)
}

/**
 * 检查 API Key 是否已配置
 */
export function isAIConfigured() {
  return !!API_KEY
}
