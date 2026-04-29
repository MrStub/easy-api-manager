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
      @update:apiName="onApiNameChange"
      @update:url="setUrl"
      @update:method="setMethod"
    />

    <RequestParamsCard
      :query-conditions="queryConditions"
      :query-form="queryForm"
      :json-text="jsonText"
      :loading="loading"
      @update:field="handleFieldChange"
      @send="handleSendRequest"
      @clear="resetForm"
    />

    <ResultCard
      :active-result-mode="activeResultMode"
      :response-table="pagedResponseTable"
      :full-response-table="responseTable"
      :formatted-json="formattedJson"
      :error="error"
      :status-code="statusCode"
      :response-time="responseTime"
      :show-pagination="showPagination"
      :pagination="pagination"
      :trade-name="tradeName"
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
      'apiUrlMap',
      'url',
      'method',
      'jsonText',
      'queryConditions',
      'queryForm',
      'params',
      'responseTable',
      'loading',
      'error',
      'statusCode',
      'responseTime',
      'activeResultMode',
      'pagination',
      'tradeName'
    ]),
    ...mapGetters('apiTester', ['formattedJson', 'showPagination', 'pagedResponseTable'])
  },
  methods: {
    ...mapMutations('apiTester', {
      setApiName: 'SET_API_NAME',
      setUrl: 'SET_URL',
      setMethod: 'SET_METHOD',
      setActiveResultMode: 'SET_ACTIVE_RESULT_MODE',
      resetForm: 'RESET_FORM',
      setPagination: 'SET_PAGINATION'
    }),
    ...mapActions('apiTester', {
      sendRequestAction: 'sendRequest',
      fetchInterfaceListAction: 'fetchInterfaceList',
      fetchQueryConditionsAction: 'fetchQueryConditions',
      updateQueryFieldAction: 'updateQueryField'
    }),
    async onApiNameChange(name) {
      this.setApiName(name)
      const url = this.apiUrlMap[name]
      if (url) this.setUrl(url)
      const method = this.$store.state.apiTester.interfaceMethodMap?.[name]
      if (method) this.setMethod(method)
      const result = await this.fetchQueryConditionsAction(name)
      if (result && result.message) {
        this.$message.warning(result.message)
      }
    },
    handleFieldChange(payload) {
      this.updateQueryFieldAction(payload)
    },
    async handleSendRequest() {
      const result = await this.sendRequestAction()
      if (result && result.message) {
        this.$message.warning(result.message)
      }
    },
    handleChangePage(page) {
      this.setPagination({ page })
    },
    handleChangePageSize(pageSize) {
      this.setPagination({ page: 1, pageSize })
    }
  },
  async mounted() {
    const result = await this.fetchInterfaceListAction()
    if (result && result.message) {
      this.$message.warning(result.message)
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

@media (max-width: 768px) {
  .page-wrap {
    padding: 12px;
  }

  .header h1 {
    font-size: 30px;
  }

  .header p {
    font-size: 16px;
  }

  .page-wrap :deep(.el-card__body) {
    padding: 14px;
  }
}
</style>
