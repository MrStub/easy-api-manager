export const DEFAULT_TRADE_NAME = 'query_trade'

export const MOCK_INTERFACE_LIST = [
  {
    apiName: '查询交易详情（不分页示例 Mock）',
    url: 'mock://sample-trade-detail',
    interfaceCode: 'query_trade',
    method: 'POST'
  },
  {
    apiName: '查询虚拟申购列表（分页示例 Mock）',
    url: 'mock://sample-subscribe-list',
    interfaceCode: 'query_subscribe_virtual',
    method: 'POST'
  },
  {
    apiName: '查询嵌套交易（Mock）',
    url: 'mock://nested-trade',
    interfaceCode: 'nested_trade',
    method: 'POST'
  },
  {
    apiName: '查询超长列表（Mock）',
    url: 'mock://long-list',
    interfaceCode: 'long_list_trade',
    method: 'POST'
  }
]

