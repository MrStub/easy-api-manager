import { resolveFieldLabel } from './fieldMap'

export function isNestedValue(value) {
  return value && typeof value === 'object'
}

export function toParamRows(value, tradeName, parentPath = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value).map((key) => {
      const name = parentPath ? `${parentPath}.${key}` : key
      return {
        paramName: name,
        paramLabel: resolveFieldLabel(tradeName, key, '--'),
        value: value[key]
      }
    })
  }

  return [
    {
      paramName: parentPath || 'value',
      paramLabel: resolveFieldLabel(tradeName, 'value', '--'),
      value
    }
  ]
}

export function toListRows(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return item
    }
    return { value: item }
  })
}
