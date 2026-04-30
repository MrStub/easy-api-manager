import { MOCK_INTERFACE_LIST } from './mockInterfaces'

function buildSuccessEnvelope(data, cost = 20) {
  return {
    request_id: `mock-${Date.now()}`,
    result_code: '000000000',
    result_msg: 'SUSSUSS',
    cost,
    data,
    encrypt_data: null
  }
}

function formatMockDate(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

// 接口列表和查询条件模板是页面初始化的两条主链路。
const queryConditionTemplates = {
  query_trade: buildSuccessEnvelope(
    {
      apiUri: '/dataservice/outer/ds/query_trade',
      paged: false,
      queryConditions: [
        {
          fieldName: 'serial_no',
          chineseName: '流水号',
          fieldType: 'String',
          inputType: 'text',
          placeholder: '请输入流水号',
          required: true,
          order: 1,
          defaultValue: '1964473314885766144'
        }
      ],
      pageConditions: []
    },
    88
  ),
  query_subscribe_virtual: buildSuccessEnvelope(
    {
      apiUri: '/dataservice/outer/fwpt/query_subscribe_virtual',
      paged: true,
      queryConditions: [
        {
          fieldName: 'ta_code',
          chineseName: 'TA 代码',
          fieldType: 'String',
          inputType: 'text',
          placeholder: '请输入 TA 代码',
          required: true,
          order: 1,
          defaultValue: 'SM5579'
        },
        {
          fieldName: 'prd_name',
          chineseName: '产品名称',
          fieldType: 'String',
          inputType: 'text',
          placeholder: '可选，支持模糊匹配',
          required: false,
          order: 2
        },
        {
          fieldName: 'value_date',
          chineseName: '净值日期',
          fieldType: 'String',
          inputType: 'date',
          placeholder: 'yyyyMMdd',
          required: true,
          order: 3,
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
          defaultValue: '100',
          description: '每页返回的记录数量'
        }
      ]
    },
    91
  ),
  nested_trade: buildSuccessEnvelope(
    {
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
    96
  ),
  long_list_trade: buildSuccessEnvelope(
    {
      apiUri: '/dataservice/mock/long_list_trade',
      paged: false,
      queryConditions: [
        {
          fieldName: 'batch_no',
          chineseName: '批次号',
          fieldType: 'String',
          inputType: 'text',
          placeholder: '请输入批次号',
          required: false,
          order: 1
        },
        {
          fieldName: 'biz_date',
          chineseName: '业务日期',
          fieldType: 'String',
          inputType: 'date',
          placeholder: 'yyyyMMdd',
          required: true,
          order: 2,
          dateFormat: 'yyyyMMdd'
        }
      ],
      pageConditions: []
    },
    94
  )
}

const sampleSubscribeList = Array.from({ length: 180 }, (_, index) => {
  const idx = index + 1
  const isDefaultMatch = idx <= 120
  return {
    serial_no: `SUB${String(202604300000 + idx)}`,
    ta_code: isDefaultMatch ? 'SM5579' : idx % 2 === 0 ? 'SM5579' : 'SM6688',
    prd_name: idx % 3 === 0 ? '稳健增利一号' : idx % 3 === 1 ? '现金管理增强A' : '均衡配置精选',
    value_date: isDefaultMatch ? formatMockDate(0) : formatMockDate(-(idx % 3)),
    investor_name: `客户${idx}`,
    confirm_amount: Number((10000 + idx * 268.35).toFixed(2)),
    confirm_share: Number((9800 + idx * 211.12).toFixed(2)),
    status: idx % 5 === 0 ? 0 : 1,
    ext_info: {
      channel_name: idx % 2 === 0 ? '直销柜台' : '线上渠道',
      agency_no: `AG${String((idx % 8) + 1).padStart(3, '0')}`,
      tags: idx % 2 === 0 ? ['高净值', '机构'] : ['零售', '长期持有']
    }
  }
})

const longListSource = Array.from({ length: 168 }, (_, index) => {
  const idx = index + 1
  return {
    row_no: idx,
    batch_no: idx % 2 === 0 ? 'BATCH-202604-A' : 'BATCH-202604-B',
    biz_date: formatMockDate(-(idx % 2)),
    product_code: `PRD${String((idx % 18) + 1).padStart(4, '0')}`,
    product_name: idx % 3 === 0 ? '现金管理增强A' : idx % 3 === 1 ? '稳健增利一号' : '均衡配置精选',
    customer_name: `客户${idx}`,
    confirm_amount: Number((5000 + idx * 88.36).toFixed(2)),
    status: idx % 7 === 0 ? 0 : 1
  }
})

function buildNestedTradeList() {
  return [
    {
      trade_id: 'TRD20260428001',
      trade_name: '嵌套交易测试A',
      trade_date: '20260428',
      participant_count: 2,
      participants: [
        {
          participant_id: 'P001',
          name: '参与方A',
          role: '买方',
          orders: [
            {
              order_id: 'ORD001',
              product_name: '产品A',
              amount: 1000000,
              details: [
                { detail_id: 'DTL001', fee_type: '管理费', fee_amount: 1500 },
                { detail_id: 'DTL002', fee_type: '托管费', fee_amount: 500 }
              ]
            },
            {
              order_id: 'ORD002',
              product_name: '产品B',
              amount: 500000,
              details: [{ detail_id: 'DTL003', fee_type: '管理费', fee_amount: 800 }]
            }
          ]
        },
        {
          participant_id: 'P002',
          name: '参与方B',
          role: '卖方',
          orders: [
            {
              order_id: 'ORD003',
              product_name: '产品C',
              amount: 2000000,
              details: [
                { detail_id: 'DTL004', fee_type: '交易佣金', fee_amount: 2000 },
                { detail_id: 'DTL005', fee_type: '印花税', fee_amount: 1000 }
              ]
            }
          ]
        }
      ],
      settlement_info: {
        settlement_date: '20260429',
        settlement_amount: 3500000,
        currency: 'CNY'
      }
    },
    {
      trade_id: 'TRD20260428002',
      trade_name: '嵌套交易测试B',
      trade_date: '20260429',
      participant_count: 1,
      participants: [
        {
          participant_id: 'P003',
          name: '参与方C',
          role: '买方',
          orders: [
            {
              order_id: 'ORD004',
              product_name: '产品D',
              amount: 760000,
              details: [
                { detail_id: 'DTL006', fee_type: '管理费', fee_amount: 620 },
                { detail_id: 'DTL007', fee_type: '服务费', fee_amount: 180 }
              ]
            }
          ]
        }
      ],
      settlement_info: {
        settlement_date: '20260430',
        settlement_amount: 760000,
        currency: 'CNY'
      }
    }
  ]
}

function mockSampleTradeDetailResult(params = {}) {
  const serialNo = params.serial_no || '1964473314885766144'
  return buildSuccessEnvelope(
    {
      interface_uri: '/dataservice/outer/ds/query_trade',
      app_id: '26b3bbc8327446c0a74aa555b734a02d',
      manager_no: '10022824',
      trace_id: `trace-${Date.now()}`,
      query_time: new Date().toISOString(),
      list: [
        {
          serial_no: serialNo,
          trade_type: '认购',
          trade_date: '20260430',
          confirm_date: '20260506',
          fund_code: 'A10001',
          fund_name: '稳健增利一号',
          investor_name: '张三',
          confirm_amount: 100000,
          confirm_share: 99876.54,
          status: 1
        }
      ]
    },
    18
  )
}

function mockSampleSubscribeResult(params = {}) {
  const page = Number(params.curr_page || 1)
  const pageSize = Number(params.curr_page_size || 100)
  const taCode = String(params.ta_code || '').trim()
  const productName = String(params.prd_name || '').trim()
  const valueDate = String(params.value_date || '').trim()

  const filteredList = sampleSubscribeList.filter((item) => {
    const taMatched = !taCode || item.ta_code === taCode
    const dateMatched = !valueDate || item.value_date === valueDate
    const productMatched = !productName || item.prd_name.includes(productName)
    return taMatched && dateMatched && productMatched
  })

  const start = (page - 1) * pageSize
  const list = filteredList.slice(start, start + pageSize)

  return buildSuccessEnvelope(
    {
      total_size: filteredList.length,
      total_page_num: filteredList.length ? Math.ceil(filteredList.length / pageSize) : 0,
      page_size: pageSize,
      curr_page: page,
      curr_page_size: list.length,
      list
    },
    25
  )
}

function mockNestedTradeResult() {
  return buildSuccessEnvelope(
    {
      interface_uri: '/dataservice/mock/nested_trade',
      manager_no: '10022824',
      query_time: new Date().toISOString(),
      list: buildNestedTradeList()
    },
    56
  )
}

function mockLongListResult(params = {}) {
  const batchNo = String(params.batch_no || '').trim()
  const bizDate = String(params.biz_date || '').trim()
  const list = longListSource.filter((item) => {
    const batchMatched = !batchNo || item.batch_no.includes(batchNo)
    const dateMatched = !bizDate || item.biz_date === bizDate
    return batchMatched && dateMatched
  })

  return buildSuccessEnvelope(
    {
      interface_uri: '/dataservice/mock/long_list_trade',
      manager_no: '10022824',
      query_time: new Date().toISOString(),
      list
    },
    31
  )
}

const interfaceListResponse = buildSuccessEnvelope({ list: MOCK_INTERFACE_LIST }, 35)

export function getMockResponse(url, method, params = {}) {
  const normalizedUrl = (url || '').toLowerCase().trim()

  if (normalizedUrl === 'mock://interface-list') return interfaceListResponse
  if (normalizedUrl === 'mock://query-conditions') {
    return queryConditionTemplates[params.interface_code] || queryConditionTemplates.query_trade
  }
  if (normalizedUrl === 'mock://sample-trade-detail') return mockSampleTradeDetailResult(params)
  if (normalizedUrl === 'mock://sample-subscribe-list') return mockSampleSubscribeResult(params)
  if (normalizedUrl === 'mock://nested-trade') return mockNestedTradeResult()
  if (normalizedUrl === 'mock://long-list') return mockLongListResult(params)

  return null
}
