<template>
  <div class="page-wrap">
    <div class="header">
      <h1>API 请求测试</h1>
      <p>面向业务同学的简单接口调试工具</p>
    </div>

    <ApiInfoCard
      :api-name="apiName"
      :api-options="apiOptions"
      :url="url"
      :method="method"
      :content-type="contentType"
      :loading="loading"
      @update:apiName="onApiNameChange"
      @update:url="setUrl"
      @update:method="setMethod"
      @send="handleSendRequest"
      @clear="resetForm"
    />

    <RequestParamsCard
      :json-text="jsonText"
      :params="params"
      @update:jsonText="setJsonText"
    />

    <ResultCard
      :active-result-mode="activeResultMode"
      :response-table="pagedResponseTable"
      :formatted-json="formattedJson"
      :error="error"
      :status-code="statusCode"
      :response-time="responseTime"
      :show-pagination="showPagination"
      :pagination="pagination"
      @update:activeResultMode="setActiveResultMode"
      @page-change="handleChangePage"
      @size-change="handleChangePageSize"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import ApiInfoCard from '../components/ApiInfoCard.vue'
import RequestParamsCard from '../components/RequestParamsCard.vue'
import ResultCard from '../components/ResultCard.vue'

export default {
  name: 'ApiTester',
  components: {
    ApiInfoCard,
    RequestParamsCard,
    ResultCard
  },
  computed: {
    ...mapState('apiTester', [
      'apiName',
      'apiOptions',
      'url',
      'method',
      'contentType',
      'jsonText',
      'params',
      'loading',
      'error',
      'statusCode',
      'responseTime',
      'activeResultMode',
      'pagination'
    ]),
    ...mapGetters('apiTester', ['formattedJson', 'showPagination', 'pagedResponseTable'])
  },
  methods: {
    ...mapMutations('apiTester', {
      setApiName: 'SET_API_NAME',
      setUrl: 'SET_URL',
      setMethod: 'SET_METHOD',
      setJsonText: 'SET_JSON_TEXT',
      setActiveResultMode: 'SET_ACTIVE_RESULT_MODE',
      resetForm: 'RESET_FORM'
    }),
    ...mapActions('apiTester', {
      sendRequestAction: 'sendRequest',
      parseJsonParamsAction: 'parseJsonParams',
      changePage: 'changePage',
      changePageSize: 'changePageSize'
    }),
    onApiNameChange(name) {
      this.setApiName(name)
      const map = {
        获取页面查询条件接口: 'mock://query-conditions',
        获取接口出参字段接口: 'mock://field-meta',
        '查询分红列表（Mock）': 'mock://dividend-list'
      }
      if (map[name]) this.setUrl(map[name])
    },
    async handleSendRequest() {
      const result = await this.sendRequestAction()
      if (result && result.message) {
        this.$message.warning(result.message)
      }
    },
    async handleChangePage(page) {
      const result = await this.changePage(page)
      if (result && result.message) {
        this.$message.warning(result.message)
      }
    },
    async handleChangePageSize(pageSize) {
      const result = await this.changePageSize(pageSize)
      if (result && result.message) {
        this.$message.warning(result.message)
      }
    }
  },
  watch: {
    jsonText: {
      immediate: true,
      handler() {
        this.parseJsonParamsAction()
      }
    }
  }
}
</script>

<style scoped>
.page-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  margin-bottom: 16px;
}

.header h1 {
  margin: 0;
  font-size: 42px;
  font-weight: 700;
  color: #111827;
}

.header p {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 22px;
}

.page-wrap :deep(.card) {
  border-radius: 10px;
  border: 1px solid #e7ebf3;
  margin-bottom: 16px;
}

.page-wrap :deep(.el-card__body) {
  padding: 24px;
}

.page-wrap :deep(.el-form-item__label) {
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

.page-wrap :deep(.el-input__inner),
.page-wrap :deep(.el-textarea__inner) {
  border-radius: 8px;
}
</style>
