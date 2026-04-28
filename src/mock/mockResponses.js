const queryConditionsResponse = {
  request_id: '69f045f2372207f56dd1b7cd',
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 113,
  data: {
    apiUri: '/dataservice/outer/ta/query_ta_dividend',
    paged: true,
    queryConditions: [
      {
        fieldName: 'bgcfmdate',
        chineseName: '开始日期',
        fieldType: 'String',
        inputType: 'date',
        placeholder: 'yyyyMMdd',
        required: true,
        order: 1,
        dateFormat: 'yyyyMMdd'
      },
      {
        fieldName: 'endcfmdate',
        chineseName: '结束日期',
        fieldType: 'String',
        inputType: 'date',
        placeholder: 'yyyyMMdd',
        required: true,
        order: 2,
        dateFormat: 'yyyyMMdd'
      }
    ],
    pageConditions: [
      {
        fieldName: 'curr_page',
        chineseName: '当前页码',
        fieldType: 'Integer',
        defaultValue: '1',
        description: '分页查询的当前页码，从1开始'
      },
      {
        fieldName: 'curr_page_size',
        chineseName: '每页记录数',
        fieldType: 'Integer',
        defaultValue: '20',
        description: '每页返回的记录数量'
      }
    ]
  },
  encrypt_data: null
}

const fieldMetaResponse = {
  request_id: '69f00f05d6808e0b00417a73',
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 83,
  data: {
    paged: true,
    fields: [
      { fieldName: 'taaccountid', chineseName: '投资人基金帐号', visible: true, dataType: 'text', order: 1 },
      { fieldName: 'confirmdate', chineseName: '确认日期', visible: true, dataType: 'text', order: 2 },
      { fieldName: 'fundcode', chineseName: '基金代码', visible: true, dataType: 'text', order: 3 },
      { fieldName: 'sharetype', chineseName: '份额类型', visible: true, dataType: 'text', order: 4 },
      { fieldName: 'investorname', chineseName: '投资者名称', visible: true, dataType: 'text', order: 29 },
      { fieldName: 'fundname', chineseName: '产品名称', visible: true, dataType: 'text', order: 31 }
    ],
    pageResults: [
      { fieldName: 'total_size', chineseName: '总记录数', fieldType: 'Long', defaultValue: null, description: '符合条件的总记录数' },
      { fieldName: 'total_page_num', chineseName: '总页数', fieldType: 'Integer', defaultValue: null, description: '总页数' },
      { fieldName: 'page_size', chineseName: '每页记录数', fieldType: 'Integer', defaultValue: null, description: '每页返回的记录数量' },
      { fieldName: 'curr_page', chineseName: '当前页码', fieldType: 'Integer', defaultValue: null, description: '当前页码' },
      { fieldName: 'curr_page_size', chineseName: '当前页记录数', fieldType: 'Integer', defaultValue: null, description: '当前页实际返回的记录数' },
      { fieldName: 'list', chineseName: '数据列表', fieldType: 'List', defaultValue: null, description: '当前页的数据列表' }
    ]
  },
  encrypt_data: null
}

function buildDividendList(total = 128) {
  return Array.from({ length: total }, (_, i) => {
    const idx = i + 1
    return {
      taaccountid: `TA2026${String(idx).padStart(5, '0')}`,
      confirmdate: `202604${String((idx % 28) + 1).padStart(2, '0')}`,
      fundcode: `FUND${String((idx % 20) + 1).padStart(4, '0')}`,
      sharetype: idx % 2 === 0 ? 'A' : 'B',
      investorname: `投资者${idx}`,
      fundname: `产品${(idx % 12) + 1}`,
      status: idx % 4 === 0 ? 0 : 1
    }
  })
}

const fullList = buildDividendList(128)

function mockDividendResult(params = {}) {
  const page = Number(params.page || params.curr_page || 1)
  const pageSize = Number(params.pageSize || params.curr_page_size || 10)
  const start = (page - 1) * pageSize
  const list = fullList.slice(start, start + pageSize)

  return {
    request_id: `mock-${Date.now()}`,
    result_code: '000000000',
    result_msg: 'SUSSUSS',
    cost: 22,
    data: {
      total_size: fullList.length,
      total_page_num: Math.ceil(fullList.length / pageSize),
      page_size: pageSize,
      curr_page: page,
      curr_page_size: list.length,
      list
    },
    encrypt_data: null
  }
}

export function getMockResponse(url, method, params = {}) {
  const normalized = (url || '').toLowerCase().trim()

  if (normalized === 'mock://query-conditions') return queryConditionsResponse
  if (normalized === 'mock://field-meta') return fieldMetaResponse
  if (normalized === 'mock://dividend-list') return mockDividendResult(params)

  if (normalized.includes('query-conditions')) return queryConditionsResponse
  if (normalized.includes('field-meta')) return fieldMetaResponse
  if (normalized.includes('dividend') || normalized.includes('query_ta_dividend')) {
    return mockDividendResult(params)
  }

  return null
}
