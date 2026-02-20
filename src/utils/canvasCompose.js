/**
 * Canvas 主图合成逻辑
 * 输入：商品图片(base64/null)、商品名、卖点、风格编号(0/1/2)
 * 输出：Promise<dataURL>
 */

const W = 800
const H = 800

function wrapText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const char of text) {
    if (ctx.measureText(line + char).width > maxWidth) {
      lines.push(line)
      line = char
    } else {
      line += char
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawStyle0(ctx, img, name, bullet) {
  // 风格1：白底 + 商品图居中 + 底部深色文字条
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, W, H)

  if (img) {
    const scale = Math.min((W - 80) / img.width, (H - 200) / img.height)
    const iw = img.width * scale, ih = img.height * scale
    ctx.drawImage(img, (W - iw) / 2, (H - 200 - ih) / 2 + 20, iw, ih)
  } else {
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(100, 80, W - 200, H - 300)
    ctx.fillStyle = '#ccc'
    ctx.font = '60px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📷', W / 2, (H - 200) / 2 + 20)
  }

  // 底部深色条
  ctx.fillStyle = 'rgba(15, 17, 23, 0.9)'
  ctx.fillRect(0, H - 160, W, 160)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif'
  const titleLines = wrapText(ctx, name, W - 80)
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, W / 2, H - 145 + i * 44)
  })

  ctx.fillStyle = '#f5a623'
  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(bullet, W / 2, H - 50)
}

function drawStyle1(ctx, img, name, bullet) {
  // 风格2：渐变背景 + 商品图右置 + 左侧文字
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#1a1d27')
  grad.addColorStop(1, '#2a1a3e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  if (img) {
    const scale = Math.min(450 / img.width, 600 / img.height)
    const iw = img.width * scale, ih = img.height * scale
    ctx.drawImage(img, W - iw - 30, (H - ih) / 2, iw, ih)
  }

  // 左侧装饰线
  ctx.fillStyle = '#4f6ef7'
  ctx.fillRect(50, 180, 5, 120)

  // 文字
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 8

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px "PingFang SC", "Microsoft YaHei", sans-serif'
  const titleLines = wrapText(ctx, name, W / 2 - 40)
  titleLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, 70, 190 + i * 54)
  })

  const yOff = 190 + Math.min(titleLines.length, 3) * 54 + 20
  ctx.fillStyle = '#f5a623'
  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('✦ ' + bullet, 70, yOff)

  ctx.shadowBlur = 0
}

function drawStyle2(ctx, img, name, bullet) {
  // 风格3：图片铺满 + 半透明蒙层 + 居中白色文字
  if (img) {
    const scale = Math.max(W / img.width, H / img.height)
    const iw = img.width * scale, ih = img.height * scale
    ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih)
  } else {
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0f1117')
    grad.addColorStop(0.5, '#22263a')
    grad.addColorStop(1, '#1a1d27')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  }

  // 蒙层
  ctx.fillStyle = 'rgba(15, 17, 23, 0.6)'
  ctx.fillRect(0, 0, W, H)

  // 装饰框
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  ctx.strokeRect(60, 60, W - 120, H - 120)

  // 居中文字
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 12

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px "PingFang SC", "Microsoft YaHei", sans-serif'
  const titleLines = wrapText(ctx, name, W - 160)
  const totalH = titleLines.length * 58
  const startY = H / 2 - totalH / 2 - 30
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * 58)
  })

  ctx.fillStyle = '#f5a623'
  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(bullet, W / 2, startY + Math.min(titleLines.length, 2) * 58 + 30)

  // 底部小字
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '18px "DM Mono", monospace'
  ctx.fillText('800 × 800', W / 2, H - 40)

  ctx.shadowBlur = 0
}

const drawFns = [drawStyle0, drawStyle1, drawStyle2]

export function composeImage(imageBase64, name, bullet, styleIndex) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const drawFn = drawFns[styleIndex] || drawStyle0

    const finish = (img) => {
      drawFn(ctx, img, name || '商品标题', bullet || '核心卖点')
      resolve(canvas.toDataURL('image/png'))
    }

    if (imageBase64) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => finish(img)
      img.onerror = () => finish(null)
      img.src = imageBase64
    } else {
      finish(null)
    }
  })
}

export function composeToCanvas(canvasEl, imageBase64, name, bullet, styleIndex) {
  return new Promise((resolve) => {
    if (!canvasEl) return resolve()
    canvasEl.width = W
    canvasEl.height = H
    const ctx = canvasEl.getContext('2d')
    const drawFn = drawFns[styleIndex] || drawStyle0

    const finish = (img) => {
      drawFn(ctx, img, name || '商品标题', bullet || '核心卖点')
      resolve()
    }

    if (imageBase64) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => finish(img)
      img.onerror = () => finish(null)
      img.src = imageBase64
    } else {
      finish(null)
    }
  })
}
