import request from '../../api/request'
import { buildRequestParams, getValueType } from '../../utils/json'
import { extractTableData } from '../../utils/responseParser'
import { getMockResponse } from '../../mock/mockResponses'

const FALLBACK_INTERFACES = [
  { apiName: '查询分红列表（Mock）', url: 'mock://dividend-list', interfaceCode: 'query_ta_dividend', method: 'GET' },
  { apiName: '查询嵌套交易（Mock）', url: 'mock://nested-trade', interfaceCode: 'nested_trade', method: 'GET' },
  { apiName: '查询超多字段交易（Mock）', url: 'mock://large-fields', interfaceCode: 'large_fields', method: 'GET' },
  { apiName: '查询深层嵌套交易（Mock）', url: 'mock://deep-nested', interfaceCode: 'deep_nested', method: 'GET' }
]

function buildInterfaceState(list = []) {
  const apiOptions = list.map((item) => item.apiName)
  const apiUrlMap = list.reduce((acc, item) => {
    acc[item.apiName] = item.url
    return acc
  }, {})
  const interfaceCodeMap = list.reduce((acc, item) => {
    acc[item.apiName] = item.interfaceCode
    return acc
  }, {})
  const interfaceMethodMap = list.reduce((acc, item) => {
    acc[item.apiName] = item.method || 'GET'
    return acc
  }, {})

  return { apiOptions, apiUrlMap, interfaceCodeMap, interfaceMethodMap }
}

const DEFAULT_FORM = {}

function buildParamsFromForm(queryForm = {}) {
  return Object.keys(queryForm).map((key) => {
    const value = normalizeRequestValue(queryForm[key])
    return {
      name: key,
      value,
      type: getValueType(value)
    }
  })
}

function normalizeQueryConditions(data = {}) {
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

function buildFormFromConditions(conditions = [], oldForm = {}) {
  return conditions.reduce((acc, item) => {
    const hasOld = Object.prototype.hasOwnProperty.call(oldForm, item.fieldName)
    if (hasOld) {
      const oldValue = oldForm[item.fieldName]
      if (item.inputType === 'date' && isBlankValue(oldValue)) {
        acc[item.fieldName] = formatToday(item.dateFormat)
      } else {
        acc[item.fieldName] = oldValue
      }
      return acc
    }

    const defaultValue = item.defaultValue
    if (item.inputType === 'date') {
      acc[item.fieldName] = formatToday(item.dateFormat)
    } else if (defaultValue === null || defaultValue === undefined || defaultValue === '') {
      acc[item.fieldName] = ''
    } else if (item.fieldType === 'Integer' || item.fieldType === 'Long') {
      const n = Number(defaultValue)
      acc[item.fieldName] = Number.isNaN(n) ? defaultValue : n
    } else {
      acc[item.fieldName] = defaultValue
    }
    return acc
  }, {})
}

function isBlankValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function normalizeRequestValue(value) {
  if (typeof value === 'string') return value.trim()
  return value
}

function formatToday(dateFormat) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  if (dateFormat === 'yyyy-MM-dd') return `${year}-${month}-${day}`
  return `${year}${month}${day}`
}

function defaultState() {
  const params = buildParamsFromForm(DEFAULT_FORM)
  const interfaceState = buildInterfaceState(FALLBACK_INTERFACES)
  return {
    apiName: '',
    apiOptions: interfaceState.apiOptions,
    apiUrlMap: interfaceState.apiUrlMap,
    interfaceCodeMap: interfaceState.interfaceCodeMap,
    interfaceMethodMap: interfaceState.interfaceMethodMap,
    interfaceListApiUrl: 'mock://interface-list',
    url: '',
    method: 'GET',
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
      pageSize: 10
    },
    responseRawJson: '',
    loading: false,
    error: '',
    statusCode: null,
    responseTime: 0,
    activeResultMode: 'table',
    tradeName: 'query_ta_dividend',
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }
}

function getTradeName(url, params, preferredTradeName = '') {
  if (preferredTradeName) return preferredTradeName
  if (params.interface_code) return params.interface_code
  if ((url || '').includes('query_ta_dividend') || (url || '').includes('dividend')) return 'query_ta_dividend'
  if ((url || '').includes('nested-trade') || (url || '').includes('nested_trade')) return 'nested_trade'
  if ((url || '').includes('large-fields') || (url || '').includes('large_fields')) return 'large_fields'
  if ((url || '').includes('deep-nested') || (url || '').includes('deep_nested')) return 'deep_nested'
  return 'query_ta_dividend'
}

function validateRequestState(state, requestUrl) {
  if (!requestUrl) return 'URL 不能为空'
  if (!state.method) return '请求方式必须存在'

  const missingRequired = state.queryConditions.find((item) => item.required && isBlankValue(state.queryForm[item.fieldName]))
  if (missingRequired) {
    return `${missingRequired.chineseName || missingRequired.fieldName}不能为空`
  }
  return ''
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
      state.interfaceMethodMap = next.interfaceMethodMap
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
      state.method = 'GET'
      state.jsonText = ''
      state.queryConditions = []
      state.queryForm = {}
      state.params = []
      state.responseData = null
      state.responseTable = {
        list: [],
        total: 0,
        page: 1,
        pageSize: state.pagination.pageSize || 10
      }
      state.responseRawJson = ''
      state.loading = false
      state.error = ''
      state.statusCode = null
      state.responseTime = 0
      state.activeResultMode = 'table'
      state.tradeName = 'query_ta_dividend'
      state.pagination = {
        page: 1,
        pageSize: state.pagination.pageSize || 10,
        total: 0
      }
    }
  },
  actions: {
    async fetchInterfaceList({ state, commit, dispatch }) {
      try {
        let data
        if ((state.interfaceListApiUrl || '').startsWith('mock://')) {
          data = getMockResponse(state.interfaceListApiUrl, 'GET', {})
        } else {
          const res = await request.get(state.interfaceListApiUrl)
          data = res.data
        }

        const list = data?.data?.list || data?.list || []
        if (!Array.isArray(list) || !list.length) {
          commit('SET_INTERFACE_OPTIONS', FALLBACK_INTERFACES)
          const firstFallback = FALLBACK_INTERFACES[0]
          if (firstFallback) {
            commit('SET_API_NAME', firstFallback.apiName)
            commit('SET_URL', firstFallback.url)
            commit('SET_METHOD', firstFallback.method || 'GET')
            await dispatch('fetchQueryConditions', firstFallback.apiName)
          }
          return { ok: false, message: '接口列表为空，已使用默认列表' }
        }

        commit('SET_INTERFACE_OPTIONS', list)
        const selectedName = list.find((item) => item.apiName === state.apiName)?.apiName || list[0]?.apiName
        const selected = list.find((item) => item.apiName === selectedName)
        if (selected && selected.apiName) {
          commit('SET_API_NAME', selected.apiName)
          commit('SET_URL', selected.url || '')
          commit('SET_METHOD', selected.method || 'GET')
          await dispatch('fetchQueryConditions', selected.apiName)
        }
        return { ok: true }
      } catch (err) {
        commit('SET_INTERFACE_OPTIONS', FALLBACK_INTERFACES)
        const firstFallback = FALLBACK_INTERFACES[0]
        if (firstFallback) {
          commit('SET_API_NAME', firstFallback.apiName)
          commit('SET_URL', firstFallback.url)
          commit('SET_METHOD', firstFallback.method || 'GET')
          await dispatch('fetchQueryConditions', firstFallback.apiName)
        }
        return { ok: false, message: '查询接口列表失败，已使用默认列表' }
      }
    },
    async fetchQueryConditions({ state, commit }, apiName) {
      const interfaceCode = state.interfaceCodeMap?.[apiName] || 'query_ta_dividend'
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
          pageSize: state.pagination.pageSize,
          total: table.total
        })
        return { ok: true }
      } catch (err) {
        const end = Date.now()
        commit('SET_RESPONSE_TIME', end - start)
        commit('SET_STATUS_CODE', err.response?.status || null)
        commit('SET_RESPONSE_DATA', err.response?.data || null)
        commit('SET_RESPONSE_TABLE', { list: [], total: 0, page: 1, pageSize: state.pagination.pageSize })
        commit('SET_PAGINATION', { total: 0 })
        commit('SET_ERROR', err.normalizedMessage || err.message || '请求失败')
        return { ok: false }
      } finally {
        commit('SET_LOADING', false)
      }
    },
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
