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

export function parseJsonToParams(jsonText) {
  const parsed = JSON.parse(jsonText || '{}')
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('JSON 顶层必须是对象')
  }

  return Object.keys(parsed).map((key) => ({
    name: key,
    value: parsed[key],
    type: getValueType(parsed[key])
  }))
}

export function buildRequestParams(params = []) {
  return params.reduce((acc, item) => {
    if (!item || !item.name) return acc
    acc[item.name] = item.value
    return acc
  }, {})
}
