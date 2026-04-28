import request from '../../api/request'
import { parseJsonToParams, buildRequestParams } from '../../utils/json'
import { extractTableData } from '../../utils/responseParser'
import { getMockResponse } from '../../mock/mockResponses'

const DEFAULT_JSON = `{
  "page": 1,
  "pageSize": 10,
  "keyword": "张三"
}`

function defaultState() {
  const params = parseJsonToParams(DEFAULT_JSON)
  return {
    apiName: '',
    apiOptions: ['获取页面查询条件接口', '获取接口出参字段接口', '查询分红列表（Mock）'],
    url: 'mock://dividend-list',
    method: 'GET',
    contentType: 'application/json',
    jsonText: DEFAULT_JSON,
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
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }
}

function getTradeName(url, params) {
  if (params.interface_code) return params.interface_code
  if ((url || '').includes('query_ta_dividend') || (url || '').includes('dividend')) return 'query_ta_dividend'
  return 'query_ta_dividend'
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
    SET_JSON_TEXT(state, value) {
      state.jsonText = value
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
    SET_PAGINATION(state, payload) {
      state.pagination = {
        ...state.pagination,
        ...payload
      }
    },
    RESET_FORM(state) {
      const reset = defaultState()
      Object.keys(reset).forEach((key) => {
        state[key] = reset[key]
      })
    }
  },
  actions: {
    parseJsonParams({ state, commit }) {
      try {
        const parsed = parseJsonToParams(state.jsonText)
        commit('SET_PARAMS', parsed)
        return { ok: true }
      } catch (err) {
        return { ok: false, message: 'JSON 格式不正确，请检查后重试' }
      }
    },
    async sendRequest({ state, commit, dispatch }) {
      const requestUrl = (state.url || '').trim()
      if (!requestUrl) {
        return { ok: false, message: 'URL 不能为空' }
      }
      if (requestUrl !== state.url) {
        commit('SET_URL', requestUrl)
      }
      if (!state.method) {
        return { ok: false, message: '请求方式必须存在' }
      }

      const parseResult = await dispatch('parseJsonParams')
      if (!parseResult.ok) return parseResult

      const hasEmptyName = state.params.some((item) => !item.name || !String(item.name).trim())
      if (hasEmptyName) {
        return { ok: false, message: '参数名不能为空，请检查后重试' }
      }

      const requestParams = buildRequestParams(state.params)
      const start = Date.now()

      commit('SET_LOADING', true)
      commit('SET_ERROR', '')
      commit('SET_STATUS_CODE', null)

      try {
        const mockData = getMockResponse(requestUrl, state.method, requestParams)
        let res
        if (mockData) {
          console.log('api-mananger：[API Tester] request payload', {
            url: requestUrl,
            method: state.method,
            body: state.method === 'GET' ? null : requestParams,
            params: state.method === 'GET' ? requestParams : null
          })
          await new Promise((resolve) => setTimeout(resolve, 120))
          res = { status: 200, data: mockData }
        } else {
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
          console.log('api-mananger：[API Tester] request payload', {
            url: config.url,
            method: config.method,
            body: config.data || null,
            params: config.params || null
          })
          res = await request(config)
        }
        const end = Date.now()
        const table = extractTableData(res.data, getTradeName(requestUrl, requestParams))

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
        commit('SET_ERROR', err.message || '请求失败')
        return { ok: false }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    changePage({ commit }, page) {
      commit('SET_PAGINATION', { page })
      return { ok: true }
    },
    changePageSize({ commit }, pageSize) {
      commit('SET_PAGINATION', { page: 1, pageSize })
      return { ok: true }
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
