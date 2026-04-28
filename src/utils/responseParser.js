import { getFieldLabel } from './fieldMap'

function buildDataRows(data, tradeName) {
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) return item
      return { value: item }
    })
  }

  if (data && typeof data === 'object') {
    return Object.keys(data).map((key) => ({
      paramName: key,
      paramLabel: getFieldLabel(tradeName, key),
      value: data[key]
    }))
  }

  if (data === undefined || data === null) return []

  return [
    {
      paramName: 'value',
      paramLabel: getFieldLabel(tradeName, 'value'),
      value: data
    }
  ]
}

export function extractTableData(response, tradeName = 'query_ta_dividend') {
  const safeRes = response || {}
  const data = Object.prototype.hasOwnProperty.call(safeRes, 'data') ? safeRes.data : safeRes

  const list = buildDataRows(data, tradeName)

  const total = list.length
  const page = 1
  const pageSize = 10

  return {
    list,
    total,
    page,
    pageSize
  }
}

export function generateColumns(list = [], tradeName = 'query_ta_dividend') {
  if (!Array.isArray(list) || list.length === 0) return []
  if (list.some((row) => Object.prototype.hasOwnProperty.call(row || {}, 'paramName'))) {
    return [
      { prop: 'paramName', label: getFieldLabel('common', 'paramName') },
      { prop: 'paramLabel', label: getFieldLabel('common', 'paramLabel') },
      { prop: 'value', label: getFieldLabel('common', 'value') }
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
    label: getFieldLabel('common', key) || getFieldLabel(tradeName, key) || key
  }))
}

export function formatStatusValue(value) {
  if (value === 1 || value === '1') return '启用'
  if (value === 0 || value === '0') return '禁用'
  return value
}
