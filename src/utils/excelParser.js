import * as XLSX from 'xlsx'

/**
 * 解析 Excel 文件为商品数据数组
 * @param {File} file
 * @returns {Promise<{ data: Array, errors: Array }>}
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' })

        const data = []
        const errors = []

        raw.forEach((row, idx) => {
          const rowErrors = []
          if (!row['商品名称']) rowErrors.push('商品名称为空')
          if (!row['类目']) rowErrors.push('类目为空')
          if (!row['目标平台']) rowErrors.push('目标平台为空')

          const product = {
            _rowIndex: idx,
            name: String(row['商品名称'] || ''),
            category: String(row['类目'] || ''),
            brand: String(row['品牌'] || ''),
            material: String(row['材质'] || ''),
            size: String(row['尺寸规格'] || ''),
            colors: row['颜色款式'] ? String(row['颜色款式']).split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [],
            audience: String(row['适用人群'] || '通用'),
            sellingPoints: row['核心卖点'] ? String(row['核心卖点']).split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean) : [],
            price: row['价格'] ? Number(row['价格']) || 0 : 0,
            platforms: row['目标平台'] ? String(row['目标平台']).split(/[,，、]/).map((s) => s.trim()).filter(Boolean) : [],
            images: [],
            refImages: [],
            notes: String(row['备注'] || ''),
            _errors: rowErrors,
          }

          data.push(product)
          if (rowErrors.length > 0) {
            errors.push({ row: idx + 2, errors: rowErrors })
          }
        })

        resolve({ data, errors })
      } catch (err) {
        reject(new Error('Excel 解析失败: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 生成 Excel 模板文件并下载
 */
export function downloadTemplate() {
  const headers = ['商品名称', '类目', '品牌', '材质', '尺寸规格', '颜色款式', '适用人群', '核心卖点', '价格', '目标平台', '备注']
  const example = ['超轻透气运动鞋', '鞋靴', 'AirStep', '飞织网面', '36-44码', '黑色、白色、灰蓝', '女性', '透气不捂脚、底部防滑、轻量180g', '99', '淘宝、抖音', '']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])

  // 设置列宽
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length * 2, 12) }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '商品导入模板')
  XLSX.writeFile(wb, '商品导入模板.xlsx')
}
