export function getValueType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'

  const type = typeof value
  if (type === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number'
  }
  if (type === 'string') return 'string'
  if (type === 'boolean') return 'boolean'
  if (type === 'object') return 'object'
  return 'string'
}

export function buildRequestParams(params = []) {
  return params.reduce((acc, item) => {
    if (!item || !item.name) return acc
    acc[item.name] = item.value
    return acc
  }, {})
}
