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

const nestedTradeQueryConditionsResponse = {
  request_id: '69f045f2372207f56dd1b7ce',
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 96,
  data: {
    apiUri: '/dataservice/mock/nested_trade',
    paged: false,
    queryConditions: [
      {
        fieldName: 'tradeDate',
        chineseName: '交易日期',
        fieldType: 'String',
        inputType: 'date',
        placeholder: 'yyyyMMdd',
        required: true,
        order: 1,
        dateFormat: 'yyyyMMdd'
      },
      {
        fieldName: 'tradeId',
        chineseName: '交易ID',
        fieldType: 'String',
        inputType: 'text',
        placeholder: '请输入交易ID',
        required: false,
        order: 2
      }
    ],
    pageConditions: []
  },
  encrypt_data: null
}

const largeFieldsQueryConditionsResponse = {
  request_id: '69f045f2372207f56dd1b7cf',
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 92,
  data: {
    apiUri: '/dataservice/mock/large_fields',
    paged: false,
    queryConditions: [
      {
        fieldName: 'batchNo',
        chineseName: '批次号',
        fieldType: 'String',
        inputType: 'text',
        placeholder: '请输入批次号',
        required: false,
        order: 1
      }
    ],
    pageConditions: []
  },
  encrypt_data: null
}

const deepNestedQueryConditionsResponse = {
  request_id: '69f045f2372207f56dd1b7d0',
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 90,
  data: {
    apiUri: '/dataservice/mock/deep_nested',
    paged: false,
    queryConditions: [
      {
        fieldName: 'requestId',
        chineseName: '请求ID',
        fieldType: 'String',
        inputType: 'text',
        placeholder: '可不填，默认随机',
        required: false,
        order: 1
      }
    ],
    pageConditions: []
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

function buildNestedTrade() {
  return {
    tradeInfo: {
      tradeId: 'TRD20260428001',
      tradeName: '嵌套交易测试',
      tradeDate: '20260428',
      participants: [
        {
          participantId: 'P001',
          name: '参与方A',
          role: '买方',
          orders: [
            {
              orderId: 'ORD001',
              productName: '产品A',
              amount: 1000000.0,
              details: [
                { detailId: 'DTL001', feeType: '管理费', feeAmount: 1500.0 },
                { detailId: 'DTL002', feeType: '托管费', feeAmount: 500.0 }
              ]
            },
            {
              orderId: 'ORD002',
              productName: '产品B',
              amount: 500000.0,
              details: [
                { detailId: 'DTL003', feeType: '管理费', feeAmount: 800.0 }
              ]
            }
          ]
        },
        {
          participantId: 'P002',
          name: '参与方B',
          role: '卖方',
          orders: [
            {
              orderId: 'ORD003',
              productName: '产品C',
              amount: 2000000.0,
              details: [
                { detailId: 'DTL004', feeType: '交易佣金', feeAmount: 2000.0 },
                { detailId: 'DTL005', feeType: '印花税', feeAmount: 1000.0 }
              ]
            }
          ]
        }
      ]
    }
  }
}

function buildLargeItem(idx) {
  const item = {}
  for (let i = 1; i <= 25; i++) {
    const key = `item_field_${String(i).padStart(2, '0')}`
    if (i === 1) item[key] = `ITEM-${String(idx).padStart(4, '0')}`
    else if (i === 2) item[key] = `名称_${idx}`
    else if (i <= 8) item[key] = `值_${idx}_${i}`
    else if (i <= 16) item[key] = (idx * 100 + i) * 1.5
    else if (i <= 24) item[key] = i % 3 === 0
    else item[key] = `备注_${idx}_${i}`
  }
  return item
}

function buildLargeSubject() {
  const subject = {}
  for (let i = 1; i <= 24; i++) {
    const key = `sub_field_${String(i).padStart(2, '0')}`
    if (i <= 6) subject[key] = `子字段值_${i}`
    else if (i <= 12) subject[key] = i * 111
    else if (i <= 18) subject[key] = i % 2 === 0
    else subject[key] = `描述_${i}`
  }
  subject.sub_field_25_items = Array.from({ length: 25 }, (_, i) => buildLargeItem(i + 1))
  return subject
}

function buildLargeFields() {
  const data = {}
  for (let i = 1; i <= 24; i++) {
    const key = `field_${String(i).padStart(2, '0')}`
    if (i === 1) data[key] = 'LF20260428001'
    else if (i === 2) data[key] = '超大字段测试交易'
    else if (i <= 8) data[key] = `文本值_${i}`
    else if (i <= 14) data[key] = i * 1000
    else if (i <= 20) data[key] = i % 2 === 0
    else data[key] = `备注字段_${i}`
  }
  data.field_25_subject = buildLargeSubject()
  return data
}

const largeFieldsResponse = {
  request_id: `mock-${Date.now()}`,
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 35,
  data: buildLargeFields(),
  encrypt_data: null
}

function buildDeepLeaf() {
  return {
    level: 9,
    name: '第九层（叶子节点）',
    description: '这是最深层的对象，无下级嵌套，包含基本字段',
    leaf_value_str: '终点',
    leaf_value_num: 999,
    leaf_value_bool: true,
    is_leaf: true
  }
}

function buildDeepL7Arr() {
  return Array.from({ length: 3 }, (_, i) => ({
    level: 8,
    name: `第八层数组项_${i + 1}`,
    item_id: `L8_ITEM_${i + 1}`,
    go_deeper_L8: buildDeepLeaf()
  }))
}

function buildDeepL6Obj() {
  return {
    level: 7,
    name: '第七层（对象）',
    note: '此层包含一个数组，数组项包含下一级对象',
    go_deeper_L7_arr: buildDeepL7Arr()
  }
}

function buildDeepL5Arr() {
  return Array.from({ length: 3 }, (_, i) => ({
    level: 6,
    name: `第六层数组项_${i + 1}`,
    item_id: `L6_ITEM_${i + 1}`,
    go_deeper_L6: buildDeepL6Obj()
  }))
}

function buildDeepL4Obj() {
  return {
    level: 5,
    name: '第五层（对象）',
    note: '此层包含一个数组，数组项包含下一级对象',
    go_deeper_L5_arr: buildDeepL5Arr()
  }
}

function buildDeepL3Arr() {
  return Array.from({ length: 3 }, (_, i) => ({
    level: 4,
    name: `第四层数组项_${i + 1}`,
    item_id: `L4_ITEM_${i + 1}`,
    go_deeper_L4: buildDeepL4Obj()
  }))
}

function buildDeepL2Obj() {
  return {
    level: 3,
    name: '第三层（对象）',
    note: '此层包含一个数组，数组项包含下一级对象',
    go_deeper_L3_arr: buildDeepL3Arr()
  }
}

function buildDeepL1Obj() {
  return {
    level: 2,
    name: '第二层（对象）',
    note: '此层包含一个对象，该对象包含下一级对象',
    go_deeper_L2: buildDeepL2Obj()
  }
}

function buildDeepNested() {
  return {
    level: 1,
    name: '第一层（根数据）',
    request_id: `deep-${Date.now()}`,
    note: '共 9 层嵌套：对象 → 对象 → 对象 → 数组 → 对象 → 数组 → 对象 → 数组 → 对象',
    go_deeper_L1: buildDeepL1Obj()
  }
}

const deepNestedResponse = {
  request_id: `mock-${Date.now()}`,
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 42,
  data: buildDeepNested(),
  encrypt_data: null
}

const nestedTradeResponse = {
  request_id: `mock-${Date.now()}`,
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 56,
  data: buildNestedTrade(),
  encrypt_data: null
}

const interfaceListResponse = {
  request_id: `mock-${Date.now()}`,
  result_code: '000000000',
  result_msg: 'SUSSUSS',
  cost: 35,
  data: {
    list: [
      { apiName: '查询分红列表（Mock）', url: 'mock://dividend-list', interfaceCode: 'query_ta_dividend', method: 'GET' },
      { apiName: '查询嵌套交易（Mock）', url: 'mock://nested-trade', interfaceCode: 'nested_trade', method: 'GET' },
      { apiName: '查询超多字段交易（Mock）', url: 'mock://large-fields', interfaceCode: 'large_fields', method: 'GET' },
      { apiName: '查询深层嵌套交易（Mock）', url: 'mock://deep-nested', interfaceCode: 'deep_nested', method: 'GET' }
    ]
  },
  encrypt_data: null
}

function getQueryConditionTemplate(interfaceCode) {
  if (interfaceCode === 'query_ta_dividend') return queryConditionsResponse
  if (interfaceCode === 'nested_trade') return nestedTradeQueryConditionsResponse
  if (interfaceCode === 'large_fields') return largeFieldsQueryConditionsResponse
  if (interfaceCode === 'deep_nested') return deepNestedQueryConditionsResponse
  return queryConditionsResponse
}

export function getMockResponse(url, method, params = {}) {
  const normalized = (url || '').toLowerCase().trim()

  if (normalized === 'mock://interface-list') return interfaceListResponse
  if (normalized === 'mock://query-conditions') return getQueryConditionTemplate(params.interface_code)
  if (normalized === 'mock://field-meta') return fieldMetaResponse
  if (normalized === 'mock://dividend-list') return mockDividendResult(params)
  if (normalized === 'mock://nested-trade') return nestedTradeResponse
  if (normalized === 'mock://large-fields') return largeFieldsResponse
  if (normalized === 'mock://deep-nested') return deepNestedResponse

  return null
}
