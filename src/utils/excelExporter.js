import { generateColumns } from './responseParser'
import { isNestedValue, toListRows, toParamRows } from './nestedData'

function isWechatBrowser() {
  if (typeof navigator === 'undefined') return false
  return /micromessenger/i.test(navigator.userAgent || '')
}

function openWechatDownloadWindow() {
  const downloadWindow = window.open('', '_blank')
  if (downloadWindow) {
    downloadWindow.document.write('<p style="font-size:16px;line-height:1.8;padding:24px;">Excel 正在生成，请稍候...</p>')
  }
  return downloadWindow
}

function normalizeExportValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

function calcDisplayWidth(text) {
  return String(text || '').split('').reduce((sum, ch) => {
    return sum + (/[^\x00-\xff]/.test(ch) ? 2 : 1)
  }, 0)
}

function sanitizeSheetName(raw) {
  return String(raw || 'Sheet').replace(/[\\/?*[\]:]/g, '_').slice(0, 31) || 'Sheet'
}

function sanitizeFileName(raw) {
  return String(raw || '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80)
}

async function downloadBlob(blob, fileName, preparedWindow = null) {
  const nav = window.navigator
  if (nav.msSaveOrOpenBlob) {
    nav.msSaveOrOpenBlob(blob, fileName)
    return
  }

  const urlApi = window.URL || window.webkitURL
  const url = urlApi.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (preparedWindow && !preparedWindow.closed) {
    preparedWindow.location.href = url
  }

  setTimeout(() => {
    urlApi.revokeObjectURL(url)
  }, 10000)
}

function applySheetStyles(XLSX, ws, aoa, cols, rows) {
  ws['!cols'] = cols.map((col) => {
    const headerWidth = calcDisplayWidth(col.label || '')
    const bodyWidth = rows.reduce((max, row) => {
      const cellValue = row[col.prop]
      if (isNestedValue(cellValue)) return Math.max(max, 12)
      const lines = String(normalizeExportValue(cellValue) || '').split('\n')
      const longest = lines.reduce((m, line) => Math.max(m, calcDisplayWidth(line)), 0)
      return Math.max(max, Math.min(60, longest))
    }, 8)
    return { wch: Math.min(60, Math.max(12, headerWidth + 2, bodyWidth + 2)) }
  })

  const maxRow = aoa.length - 1
  const maxCol = cols.length - 1
  for (let r = 0; r <= maxRow; r += 1) {
    for (let c = 0; c <= maxCol; c += 1) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (!ws[addr]) ws[addr] = { t: 's', v: '' }
      const baseStyle = {
        alignment: {
          wrapText: true,
          vertical: 'top',
          horizontal: 'left'
        }
      }
      ws[addr].s = r === 0 ? { ...baseStyle, font: { bold: true } } : baseStyle
    }
  }
}

function applyLinks(XLSX, ws, pendingLinks) {
  pendingLinks.forEach((link) => {
    const addr = XLSX.utils.encode_cell({ r: link.r, c: link.c })
    if (!ws[addr]) ws[addr] = { t: 's', v: '查看详情' }
    ws[addr].v = '查看详情'
    ws[addr].t = 's'
    ws[addr].l = { Target: link.target, Tooltip: '点击查看详情' }
    ws[addr].s = {
      font: {
        color: { rgb: '0563C1' },
        underline: true
      },
      alignment: {
        wrapText: true,
        vertical: 'top',
        horizontal: 'left'
      }
    }
  })
}

function appendSheetForValue(XLSX, context, title, value, fixedName = '') {
  let rows = []
  if (Array.isArray(value)) rows = toListRows(value)
  else if (isNestedValue(value)) rows = toParamRows(value, context.tradeName)
  else rows = [{ value }]

  const cols = generateColumns(rows, context.tradeName)
  const sheetName = fixedName || context.makeUniqueSheetName(`${title}_${++context.sheetCounter}`)
  const aoa = [cols.map((col) => col.label)]
  const pendingLinks = []
  const childTasks = []

  // 当前 sheet 先落一层数据，再递归为嵌套对象/数组生成子 sheet。
  rows.forEach((row, rowIdx) => {
    const outRow = []
    cols.forEach((col, colIdx) => {
      const cellValue = row[col.prop]
      if (isNestedValue(cellValue)) {
        const childName = context.makeUniqueSheetName(`${sheetName}_${col.label}_${rowIdx + 1}`)
        childTasks.push({
          title: `${sheetName}_${col.label}_${rowIdx + 1}`,
          value: cellValue,
          sheetName: childName
        })
        outRow.push('查看详情')
        pendingLinks.push({
          r: rowIdx + 1,
          c: colIdx,
          target: `#'${childName}'!A1`
        })
      } else {
        outRow.push(normalizeExportValue(cellValue))
      }
    })
    aoa.push(outRow)
  })

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  applySheetStyles(XLSX, ws, aoa, cols, rows)
  applyLinks(XLSX, ws, pendingLinks)
  XLSX.utils.book_append_sheet(context.wb, ws, sheetName)

  childTasks.forEach((task) => {
    appendSheetForValue(XLSX, context, task.title, task.value, task.sheetName)
  })
}

export async function exportResponseExcel({ rows, tradeName }) {
  const inWechat = isWechatBrowser()
  const preparedWindow = inWechat ? openWechatDownloadWindow() : null
  const XLSX = await import('xlsx-js-style')
  const usedSheetNames = new Set()
  const context = {
    wb: XLSX.utils.book_new(),
    tradeName,
    sheetCounter: 0,
    makeUniqueSheetName(baseName) {
      const seed = sanitizeSheetName(baseName) || 'Sheet'
      let name = seed
      let idx = 1
      while (usedSheetNames.has(name)) {
        const suffix = `_${idx}`
        name = `${seed.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`
        idx += 1
      }
      usedSheetNames.add(name)
      return name
    }
  }

  appendSheetForValue(XLSX, context, tradeName || '返回结果', rows)
  const tradePart = sanitizeFileName(tradeName || 'api_result') || 'api_result'
  const fileName = `${tradePart}_${Date.now()}.xlsx`
  const wbout = XLSX.write(context.wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  await downloadBlob(blob, fileName, preparedWindow)
  return { inWechat }
}
