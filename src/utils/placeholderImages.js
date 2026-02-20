// 生成 SVG 占位图的 data URI
function createPlaceholderSVG(text, bgColor, accentColor, width = 800, height = 800) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${darken(bgColor)};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(255,255,255,0.15);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" />
    <circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.15}" fill="${accentColor}" opacity="0.2" />
    <circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.1}" fill="${accentColor}" opacity="0.35" />
    <text x="${width * 0.5}" y="${height * 0.42}" text-anchor="middle" fill="white" font-size="${width * 0.08}" font-family="system-ui, sans-serif" opacity="0.9">📷</text>
    <text x="${width * 0.5}" y="${height * 0.62}" text-anchor="middle" fill="white" font-size="${width * 0.04}" font-weight="bold" font-family="system-ui, -apple-system, PingFang SC, sans-serif">${escapeXml(text)}</text>
    <text x="${width * 0.5}" y="${height * 0.68}" text-anchor="middle" fill="white" font-size="${width * 0.025}" font-family="system-ui, sans-serif" opacity="0.5">示例商品图</text>
    <rect width="${width}" height="${height}" fill="url(#shine)" />
  </svg>`
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

function darken(hex) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// 预生成各商品的占位图
export const placeholderImages = {
  shoes: createPlaceholderSVG('超轻透气飞织运动鞋', '#2d3a5c', '#4f6ef7'),
  bag: createPlaceholderSVG('真皮极简通勤手提包', '#3d2a1a', '#d4915c'),
  polo: createPlaceholderSVG('男士冰丝速干POLO衫', '#1a3d2a', '#52c41a'),
  headphone: createPlaceholderSVG('无线蓝牙降噪耳机', '#2a1a3d', '#9b59b6'),
  tableware: createPlaceholderSVG('日式陶瓷餐具套装', '#3d3a1a', '#f5a623'),
}

// 生成额外变体图
export function getProductImages(key) {
  const colors = {
    shoes: [['#2d3a5c', '#4f6ef7'], ['#1e2d4a', '#6b8cff'], ['#3a2d5c', '#8b6ef7']],
    bag: [['#3d2a1a', '#d4915c'], ['#4a2d1e', '#e8a66e'], ['#3d1a2a', '#d45c7c']],
    polo: [['#1a3d2a', '#52c41a'], ['#2a3d1a', '#8cc41a'], ['#1a2d3d', '#1ac4a8']],
    headphone: [['#2a1a3d', '#9b59b6'], ['#1a1a3d', '#5959b6'], ['#3d1a2a', '#b6597a']],
    tableware: [['#3d3a1a', '#f5a623'], ['#3d2a1a', '#f57823'], ['#1a3d3a', '#23f5a6']],
  }
  const names = {
    shoes: '超轻透气飞织运动鞋',
    bag: '真皮极简通勤手提包',
    polo: '男士冰丝速干POLO衫',
    headphone: '无线蓝牙降噪耳机',
    tableware: '日式陶瓷餐具套装',
  }
  return (colors[key] || colors.shoes).map(([bg, accent]) => ({
    data: createPlaceholderSVG(names[key] || '商品', bg, accent),
    name: `${names[key] || '商品'}.svg`,
  }))
}
