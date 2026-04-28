import { getFieldLabel } from './fieldMap'

const COLUMN_LABEL_MAP = {
  paramName: '参数名',
  paramLabel: '参数中文含义',
  value: '值',
  id: 'ID',
  username: '用户名',
  name: '名称',
  mobile: '手机号',
  status: '状态',
  createTime: '创建时间',
  fieldName: '字段名',
  chineseName: '中文名',
  fieldType: '字段类型',
  inputType: '输入类型',
  placeholder: '占位提示',
  required: '是否必填',
  order: '排序',
  dateFormat: '日期格式',
  dataType: '数据类型',
  visible: '是否显示',
  description: '说明',
  apiUri: '接口地址',
  paged: '是否分页',
  queryConditions: '查询条件',
  pageConditions: '分页参数',
  fields: '出参字段',
  pageResults: '分页返回字段',
  total_size: '总记录数',
  total_page_num: '总页数',
  page_size: '每页条数',
  curr_page: '当前页',
  curr_page_size: '当前页条数',
  list: '数据列表',
  value: '值'
}

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

export function generateColumns(list = []) {
  if (!Array.isArray(list) || list.length === 0) return []
  if (list.some((row) => Object.prototype.hasOwnProperty.call(row || {}, 'paramName'))) {
    return [
      { prop: 'paramName', label: COLUMN_LABEL_MAP.paramName },
      { prop: 'paramLabel', label: COLUMN_LABEL_MAP.paramLabel },
      { prop: 'value', label: COLUMN_LABEL_MAP.value }
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
    label: COLUMN_LABEL_MAP[key] || getFieldLabel('query_ta_dividend', key) || key
  }))
}

export function formatStatusValue(value) {
  if (value === 1 || value === '1') return '启用'
  if (value === 0 || value === '0') return '禁用'
  return value
}
