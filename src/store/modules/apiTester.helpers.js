import { getValueType } from '../../utils/json'

export function buildInterfaceState(list = []) {
  const apiOptions = list.map((item) => item.apiName)
  const apiUrlMap = list.reduce((acc, item) => {
    acc[item.apiName] = item.url
    return acc
  }, {})
  const interfaceCodeMap = list.reduce((acc, item) => {
    acc[item.apiName] = item.interfaceCode
    return acc
  }, {})

  return { apiOptions, apiUrlMap, interfaceCodeMap }
}

export function isBlankValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

export function normalizeRequestValue(value) {
  if (typeof value === 'string') return value.trim()
  return value
}

export function buildParamsFromForm(queryForm = {}) {
  return Object.keys(queryForm).map((key) => {
    const value = normalizeRequestValue(queryForm[key])
    return {
      name: key,
      value,
      type: getValueType(value)
    }
  })
}

export function normalizeQueryConditions(data = {}) {
  const queryConditions = (data.queryConditions || []).map((item) => ({
    fieldName: item.fieldName,
    chineseName: item.chineseName || item.fieldName,
    fieldType: item.fieldType || 'String',
    inputType: item.inputType || 'text',
    placeholder: item.placeholder || '',
    required: !!item.required,
    defaultValue: item.defaultValue ?? '',
    dateFormat: item.dateFormat || ''
  }))

  const pageConditions = (data.pageConditions || []).map((item) => ({
    fieldName: item.fieldName,
    chineseName: item.chineseName || item.fieldName,
    fieldType: item.fieldType || 'Integer',
    inputType: 'number',
    placeholder: item.description || '',
    required: false,
    defaultValue: item.defaultValue ?? '',
    dateFormat: ''
  }))

  return queryConditions.concat(pageConditions)
}

export function formatToday(dateFormat) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  if (dateFormat === 'yyyy-MM-dd') return `${year}-${month}-${day}`
  return `${year}${month}${day}`
}

export function buildFormFromConditions(conditions = [], oldForm = {}) {
  return conditions.reduce((acc, item) => {
    const hasOld = Object.prototype.hasOwnProperty.call(oldForm, item.fieldName)
    if (hasOld) {
      const oldValue = oldForm[item.fieldName]
      acc[item.fieldName] = item.inputType === 'date' && isBlankValue(oldValue)
        ? formatToday(item.dateFormat)
        : oldValue
      return acc
    }

    const defaultValue = item.defaultValue
    if (item.inputType === 'date') {
      acc[item.fieldName] = formatToday(item.dateFormat)
    } else if (defaultValue === null || defaultValue === undefined || defaultValue === '') {
      acc[item.fieldName] = ''
    } else if (item.fieldType === 'Integer' || item.fieldType === 'Long') {
      const numericValue = Number(defaultValue)
      acc[item.fieldName] = Number.isNaN(numericValue) ? defaultValue : numericValue
    } else {
      acc[item.fieldName] = defaultValue
    }
    return acc
  }, {})
}

export function validateRequestState(state, requestUrl) {
  if (!requestUrl) return 'URL 不能为空'
  if (!state.method) return '请求方式必须存在'

  const missingRequired = state.queryConditions.find((item) => {
    return item.required && isBlankValue(state.queryForm[item.fieldName])
  })
  if (missingRequired) {
    return `${missingRequired.chineseName || missingRequired.fieldName}不能为空`
  }
  return ''
}
