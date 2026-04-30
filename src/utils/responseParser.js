import { resolveFieldLabel } from './fieldMap'

const RESULT_PAGE_SIZE = 10

function normalizeArrayRows(list = []) {
  return list.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return item
    return { value: item }
  })
}

function buildDataRows(data, tradeName) {
  if (Array.isArray(data)) {
    return normalizeArrayRows(data)
  }

  if (data && typeof data === 'object') {
    return Object.keys(data).map((key) => ({
      paramName: key,
      paramLabel: resolveFieldLabel(tradeName, key, '--'),
      value: data[key]
    }))
  }

  if (data === undefined || data === null) return []

  return [
    {
      paramName: 'value',
      paramLabel: resolveFieldLabel(tradeName, 'value', '--'),
      value: data
    }
  ]
}

function extractListCandidate(source) {
  if (!source || typeof source !== 'object') return null
  const candidates = [source.list, source.records, source.rows]
  return candidates.find((item) => Array.isArray(item)) || null
}

export function extractTableData(response, tradeName = 'query_trade') {
  const safeRes = response || {}
  const data = Object.prototype.hasOwnProperty.call(safeRes, 'data') ? safeRes.data : safeRes
  const listCandidate = extractListCandidate(data) || extractListCandidate(safeRes)

  // 表格优先消费 data.list / data.records / data.rows，JSON 视图继续保留完整报文。
  const list = listCandidate ? normalizeArrayRows(listCandidate) : buildDataRows(data, tradeName)

  const total = list.length
  const page = 1
  const pageSize = RESULT_PAGE_SIZE

  return {
    list,
    total,
    page,
    pageSize
  }
}

export function generateColumns(list = [], tradeName = 'query_trade') {
  if (!Array.isArray(list) || list.length === 0) return []
  if (list.some((row) => Object.prototype.hasOwnProperty.call(row || {}, 'paramName'))) {
    return [
      { prop: 'paramName', label: resolveFieldLabel('common', 'paramName', '参数名') },
      { prop: 'paramLabel', label: resolveFieldLabel('common', 'paramLabel', '参数中文含义') },
      { prop: 'value', label: resolveFieldLabel('common', 'value', '值') }
    ]
  }

  const sampleRows = list.slice(0, 20)
  const keys = sampleRows.reduce((acc, row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!acc.includes(key)) acc.push(key)
    })
    return acc
  }, [])

  return keys.map((key) => ({
    prop: key,
    label: resolveFieldLabel('common', key, '') || resolveFieldLabel(tradeName, key, key)
  }))
}

export function formatStatusValue(value) {
  if (value === 1 || value === '1') return '启用'
  if (value === 0 || value === '0') return '禁用'
  return value
}
