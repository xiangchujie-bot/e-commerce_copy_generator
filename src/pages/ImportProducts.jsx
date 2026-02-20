import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../context/AppContext.jsx'
import { parseExcel, downloadTemplate } from '../utils/excelParser.js'

export default function ImportProducts() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [step, setStep] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [zipName, setZipName] = useState('')
  const [parsedData, setParsedData] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const [editingCell, setEditingCell] = useState(null)

  const columns = ['name', 'category', 'brand', 'material', 'size', 'audience', 'price', 'platforms']
  const columnLabels = { name: '商品名称', category: '类目', brand: '品牌', material: '材质', size: '尺寸规格', audience: '适用人群', price: '价格', platforms: '目标平台' }

  const handleFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    try {
      const { data, errors } = await parseExcel(file)
      setParsedData(data)
      setParseErrors(errors)
      setStep(2)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFile(file)
    }
  }

  const handleZipDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.zip')) {
      setZipName(file.name)
    }
  }

  const updateCell = (rowIdx, field, value) => {
    setParsedData((prev) => {
      const next = [...prev]
      if (field === 'platforms') {
        next[rowIdx] = { ...next[rowIdx], [field]: value.split(/[,，、]/).map((s) => s.trim()).filter(Boolean) }
      } else if (field === 'price') {
        next[rowIdx] = { ...next[rowIdx], [field]: Number(value) || 0 }
      } else {
        next[rowIdx] = { ...next[rowIdx], [field]: value }
      }
      // Re-validate
      const errs = []
      if (!next[rowIdx].name) errs.push('商品名称为空')
      if (!next[rowIdx].category) errs.push('类目为空')
      if (!next[rowIdx].platforms || next[rowIdx].platforms.length === 0) errs.push('目标平台为空')
      next[rowIdx]._errors = errs
      return next
    })
    setEditingCell(null)
  }

  const validCount = parsedData.filter((d) => d._errors.length === 0).length
  const errorCount = parsedData.filter((d) => d._errors.length > 0).length
  const errorRowSet = new Set(parseErrors.map((e) => e.row))

  const handleConfirmImport = () => {
    const validProducts = parsedData
      .filter((d) => d._errors.length === 0)
      .map(({ _rowIndex, _errors, ...rest }) => ({
        ...rest,
        sellingPoints: rest.sellingPoints || [],
        colors: rest.colors || [],
        images: [],
        refImages: [],
        notes: rest.notes || '',
      }))

    if (validProducts.length > 0) {
      dispatch({ type: 'ADD_PRODUCTS_BATCH', payload: validProducts })
    }
    navigate('/')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="text-txt-secondary hover:text-white transition-colors">
          ← {step > 1 ? '上一步' : '返回'}
        </button>
        <h2 className="text-xl font-bold text-white">批量导入商品</h2>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-primary text-white' : 'bg-white/5 text-txt-disabled'
            }`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-white' : 'text-txt-disabled'}`}>
              {s === 1 ? '上传文件' : s === 2 ? '预览修正' : '确认导入'}
            </span>
            {s < 3 && <div className={`w-12 h-px ${step > s ? 'bg-primary' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: 上传 */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass rounded-2xl p-8">
            <h3 className="text-white font-bold mb-4">📄 上传 Excel 文件</h3>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`cursor-pointer border-2 border-dashed rounded-xl py-12 text-center transition-all ${
                dragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-4xl mb-3">📥</div>
              <p className="text-white text-sm mb-1">点击或拖拽上传 Excel 文件</p>
              <p className="text-txt-disabled text-xs">支持 .xlsx / .xls 格式</p>
              {fileName && <p className="text-primary text-sm mt-3">已选择: {fileName}</p>}
            </div>

            <button
              onClick={downloadTemplate}
              className="mt-4 text-sm text-primary hover:text-blue-300 transition-colors"
            >
              📋 下载导入模板
            </button>
          </div>

          <div className="glass rounded-2xl p-8">
            <h3 className="text-white font-bold mb-4">🗂️ 上传图片压缩包（可选）</h3>
            <div
              onDrop={handleZipDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-white/10 rounded-xl py-8 text-center hover:border-white/20 transition-all"
            >
              <div className="text-3xl mb-2">📦</div>
              <p className="text-txt-secondary text-sm">拖拽上传 ZIP 压缩包</p>
              <p className="text-txt-disabled text-xs mt-1">图片文件名需与商品名称对应</p>
              {zipName && <p className="text-primary text-sm mt-3">已选择: {zipName}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 预览修正 */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white">共解析 <span className="font-mono text-primary">{parsedData.length}</span> 条</span>
              <span className="text-success">✓ {validCount} 条正常</span>
              {errorCount > 0 && <span className="text-danger">✗ {errorCount} 条有问题</span>}
            </div>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/80 transition-all"
            >
              下一步 →
            </button>
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-txt-disabled font-medium text-xs">#</th>
                    {columns.map((col) => (
                      <th key={col} className="text-left px-4 py-3 text-txt-disabled font-medium text-xs">
                        {columnLabels[col]}
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-txt-disabled font-medium text-xs">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, idx) => {
                    const hasError = row._errors.length > 0
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-white/5 ${hasError ? 'bg-danger/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        <td className="px-4 py-2.5 text-txt-disabled font-mono text-xs">{idx + 1}</td>
                        {columns.map((col) => {
                          const isEditing = editingCell?.row === idx && editingCell?.col === col
                          const val = col === 'platforms' ? (row[col] || []).join('、') : String(row[col] ?? '')
                          return (
                            <td key={col} className="px-4 py-2.5">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  defaultValue={val}
                                  onBlur={(e) => updateCell(idx, col, e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && updateCell(idx, col, e.target.value)}
                                  className="bg-white/10 border border-primary/50 rounded px-2 py-1 text-white text-xs w-full outline-none"
                                />
                              ) : (
                                <span
                                  onClick={() => setEditingCell({ row: idx, col })}
                                  className="cursor-pointer text-txt-secondary hover:text-white text-xs block truncate max-w-[120px]"
                                  title={val}
                                >
                                  {val || <span className="text-txt-disabled">-</span>}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-4 py-2.5">
                          {hasError ? (
                            <span className="text-danger text-xs cursor-help" title={row._errors.join('; ')}>
                              ✗ 异常
                            </span>
                          ) : (
                            <span className="text-success text-xs">✓ 正常</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 确认导入 */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">确认导入以下商品</h3>
            <p className="text-txt-secondary text-sm mb-4">
              将导入 <span className="text-primary font-bold">{validCount}</span> 个有效商品
              {errorCount > 0 && <span className="text-danger">（{errorCount} 个异常商品将被跳过）</span>}
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
              {parsedData.filter((d) => d._errors.length === 0).map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-txt-disabled font-mono text-xs">{i + 1}</span>
                    <span className="text-white text-sm">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-txt-secondary">{d.category}</span>
                    {(d.platforms || []).map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl text-sm text-txt-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                ← 返回修改
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                ✓ 确认导入 ({validCount} 个)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
