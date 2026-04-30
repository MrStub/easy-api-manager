import request from '../../api/request'
import { buildRequestParams } from '../../utils/json'
import { extractTableData } from '../../utils/responseParser'
import { getMockResponse } from '../../mock/mockResponses'
import { DEFAULT_TRADE_NAME, MOCK_INTERFACE_LIST } from '../../mock/mockInterfaces'
import {
  buildFormFromConditions,
  buildInterfaceState,
  buildParamsFromForm,
  normalizeQueryConditions,
  validateRequestState
} from './apiTester.helpers'

const DEFAULT_FORM = {}
const RESULT_PAGE_SIZE = 10

function defaultState() {
  const params = buildParamsFromForm(DEFAULT_FORM)
  const interfaceState = buildInterfaceState(MOCK_INTERFACE_LIST)
  return {
    apiName: '',
    apiOptions: interfaceState.apiOptions,
    apiUrlMap: interfaceState.apiUrlMap,
    interfaceCodeMap: interfaceState.interfaceCodeMap,
    interfaceListApiUrl: 'mock://interface-list',
    url: '',
    method: 'POST',
    contentType: 'application/json',
    jsonText: '',
    queryConditionApiUrl: 'mock://query-conditions',
    queryConditions: [],
    queryForm: DEFAULT_FORM,
    params,
    responseData: null,
    responseTable: {
      list: [],
      total: 0,
      page: 1,
      pageSize: RESULT_PAGE_SIZE
    },
    responseRawJson: '',
    loading: false,
    error: '',
    statusCode: null,
    responseTime: 0,
    activeResultMode: 'table',
    tradeName: DEFAULT_TRADE_NAME,
    pagination: {
      page: 1,
      pageSize: RESULT_PAGE_SIZE,
      total: 0
    }
  }
}

function getTradeName(url, params, preferredTradeName = '') {
  if (preferredTradeName) return preferredTradeName
  if (params.interface_code) return params.interface_code
  if ((url || '').includes('sample-trade-detail') || (url || '').includes('query_trade')) return 'query_trade'
  if ((url || '').includes('sample-subscribe-list') || (url || '').includes('query_subscribe_virtual')) return 'query_subscribe_virtual'
  if ((url || '').includes('nested-trade') || (url || '').includes('nested_trade')) return 'nested_trade'
  if ((url || '').includes('long-list') || (url || '').includes('long_list_trade')) return 'long_list_trade'
  return DEFAULT_TRADE_NAME
}

function buildAxiosConfig(state, requestUrl, requestParams) {
  const config = {
    url: requestUrl,
    method: state.method,
    headers: {
      'Content-Type': state.contentType
    }
  }

  if (state.method === 'GET') {
    config.params = requestParams
  } else {
    config.data = requestParams
  }
  return config
}

async function requestApi(state, requestUrl, requestParams) {
  const mockData = getMockResponse(requestUrl, state.method, requestParams)
  if (mockData) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    return { status: 200, data: mockData }
  }
  return request(buildAxiosConfig(state, requestUrl, requestParams))
}

async function applySelectedInterface(commit, dispatch, item) {
  if (!item) return
  commit('SET_API_NAME', item.apiName)
  commit('SET_URL', item.url || '')
  commit('SET_METHOD', 'POST')
  await dispatch('fetchQueryConditions', item.apiName)
}

export default {
  namespaced: true,
  state: defaultState,
  mutations: {
    SET_API_NAME(state, value) {
      state.apiName = value
    },
    SET_URL(state, value) {
      state.url = value
    },
    SET_METHOD(state, value) {
      state.method = value
    },
    SET_INTERFACE_OPTIONS(state, list) {
      const next = buildInterfaceState(list)
      state.apiOptions = next.apiOptions
      state.apiUrlMap = next.apiUrlMap
      state.interfaceCodeMap = next.interfaceCodeMap
    },
    SET_JSON_TEXT(state, value) {
      state.jsonText = value
    },
    SET_QUERY_CONDITIONS(state, value) {
      state.queryConditions = value
    },
    SET_QUERY_FORM(state, value) {
      state.queryForm = value
    },
    SET_PARAMS(state, params) {
      state.params = params
    },
    SET_RESPONSE_DATA(state, data) {
      state.responseData = data
      state.responseRawJson = JSON.stringify(data, null, 2)
    },
    SET_RESPONSE_TABLE(state, table) {
      state.responseTable = table
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, value) {
      state.error = value
    },
    SET_STATUS_CODE(state, value) {
      state.statusCode = value
    },
    SET_RESPONSE_TIME(state, value) {
      state.responseTime = value
    },
    SET_ACTIVE_RESULT_MODE(state, value) {
      state.activeResultMode = value
    },
    SET_TRADE_NAME(state, value) {
      state.tradeName = value
    },
    SET_PAGINATION(state, payload) {
      state.pagination = {
        ...state.pagination,
        ...payload
      }
    },
    RESET_FORM(state) {
      state.apiName = ''
      state.url = ''
      state.method = 'POST'
      state.jsonText = ''
      state.queryConditions = []
      state.queryForm = {}
      state.params = []
      state.responseData = null
      state.responseTable = {
        list: [],
        total: 0,
        page: 1,
        pageSize: RESULT_PAGE_SIZE
      }
      state.responseRawJson = ''
      state.loading = false
      state.error = ''
      state.statusCode = null
      state.responseTime = 0
      state.activeResultMode = 'table'
      state.tradeName = DEFAULT_TRADE_NAME
      state.pagination = {
        page: 1,
        pageSize: RESULT_PAGE_SIZE,
        total: 0
      }
    }
  },
  actions: {
    async fetchInterfaceList({ state, commit, dispatch }) {
      try {
        // 启动时先拉可选接口列表；如果失败，退回本地 mock 清单。
        let data
        if ((state.interfaceListApiUrl || '').startsWith('mock://')) {
          data = getMockResponse(state.interfaceListApiUrl, 'GET', {})
        } else {
          const res = await request.get(state.interfaceListApiUrl)
          data = res.data
        }

        const list = data?.data?.list || data?.list || []
        if (!Array.isArray(list) || !list.length) {
          commit('SET_INTERFACE_OPTIONS', MOCK_INTERFACE_LIST)
          await applySelectedInterface(commit, dispatch, MOCK_INTERFACE_LIST[0])
          return { ok: false, message: '接口列表为空，已使用默认列表' }
        }

        commit('SET_INTERFACE_OPTIONS', list)
        const selectedName = list.find((item) => item.apiName === state.apiName)?.apiName || list[0]?.apiName
        const selected = list.find((item) => item.apiName === selectedName)
        await applySelectedInterface(commit, dispatch, selected)
        return { ok: true }
      } catch (err) {
        commit('SET_INTERFACE_OPTIONS', MOCK_INTERFACE_LIST)
        await applySelectedInterface(commit, dispatch, MOCK_INTERFACE_LIST[0])
        return { ok: false, message: '查询接口列表失败，已使用默认列表' }
      }
    },
    async fetchQueryConditions({ state, commit }, apiName) {
      const interfaceCode = state.interfaceCodeMap?.[apiName] || DEFAULT_TRADE_NAME
      try {
        const payload = { params: { interface_code: interfaceCode } }
        let data
        if ((state.queryConditionApiUrl || '').startsWith('mock://')) {
          data = getMockResponse(state.queryConditionApiUrl, 'POST', payload.params)
        } else {
          const res = await request.post(state.queryConditionApiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
          })
          data = res.data
        }

        const conditions = normalizeQueryConditions(data?.data || {})
        const form = buildFormFromConditions(conditions, state.queryForm)
        commit('SET_QUERY_CONDITIONS', conditions)
        commit('SET_QUERY_FORM', form)
        commit('SET_PARAMS', buildParamsFromForm(form))
        commit('SET_JSON_TEXT', JSON.stringify(form, null, 2))
        return { ok: true }
      } catch (err) {
        return { ok: false, message: '查询接口入参模板失败，请稍后重试' }
      }
    },
    updateQueryField({ state, commit }, { fieldName, value }) {
      const nextForm = {
        ...state.queryForm,
        [fieldName]: value
      }
      commit('SET_QUERY_FORM', nextForm)
      commit('SET_PARAMS', buildParamsFromForm(nextForm))
      commit('SET_JSON_TEXT', JSON.stringify(nextForm, null, 2))
      return { ok: true }
    },
    async sendRequest({ state, commit }) {
      const requestUrl = (state.url || '').trim()
      if (requestUrl !== state.url) {
        commit('SET_URL', requestUrl)
      }
      const validationMessage = validateRequestState(state, requestUrl)
      if (validationMessage) {
        return { ok: false, message: validationMessage }
      }

      const requestParams = buildRequestParams(state.params)
      const start = Date.now()

      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      commit('SET_STATUS_CODE', null)

      // tradeName 用于字段中文映射、导出命名和详情弹窗标题。
      const selectedTradeName = state.interfaceCodeMap?.[state.apiName] || ''
      const tradeName = getTradeName(requestUrl, requestParams, selectedTradeName)
      commit('SET_TRADE_NAME', tradeName)

      console.log('api-mananger：[API Tester] request payload', {
        url: requestUrl,
        method: state.method,
        body: state.method === 'GET' ? null : requestParams,
        params: state.method === 'GET' ? requestParams : null
      })

      try {
        const res = await requestApi(state, requestUrl, requestParams)
        const end = Date.now()
        const table = extractTableData(res.data, tradeName)

        commit('SET_RESPONSE_TIME', end - start)
        commit('SET_STATUS_CODE', res.status)
        commit('SET_RESPONSE_DATA', res.data)
        commit('SET_RESPONSE_TABLE', table)
        commit('SET_PAGINATION', {
          page: 1,
          pageSize: RESULT_PAGE_SIZE,
          total: table.total
        })
        return { ok: true }
      } catch (err) {
        const end = Date.now()
        commit('SET_RESPONSE_TIME', end - start)
        commit('SET_STATUS_CODE', err.response?.status || null)
        commit('SET_RESPONSE_DATA', err.response?.data || null)
        commit('SET_RESPONSE_TABLE', { list: [], total: 0, page: 1, pageSize: RESULT_PAGE_SIZE })
        commit('SET_PAGINATION', { page: 1, pageSize: RESULT_PAGE_SIZE, total: 0 })
        commit('SET_ERROR', err.normalizedMessage || err.message || '请求失败')
        return { ok: false }
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    requestParams: (state) => buildRequestParams(state.params),
    hasTableData: (state) => Array.isArray(state.responseTable.list) && state.responseTable.list.length > 0,
    formattedJson: (state) => state.responseRawJson || '',
    showPagination: (state) => Number(state.pagination.total) > state.pagination.pageSize,
    pagedResponseTable: (state) => {
      const list = state.responseTable.list || []
      const start = (state.pagination.page - 1) * state.pagination.pageSize
      return {
        ...state.responseTable,
        list: list.slice(start, start + state.pagination.pageSize)
      }
    }
  }
}
