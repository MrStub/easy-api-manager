<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="result-head">
      <span class="card-title">返回结果</span>
      <div class="meta">
        <span v-if="statusCode && !error" class="ok">请求成功 {{ statusCode }}</span>
        <span v-else-if="error" class="fail">请求失败 {{ statusCode || '' }}</span>
        <el-tag size="small">状态码 {{ statusCode || '--' }}</el-tag>
        <el-tag size="small" type="info">响应时间 {{ responseTime }}ms</el-tag>
      </div>
    </div>

    <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon />

    <el-tabs v-model="localMode" @tab-click="onModeChange">
      <el-tab-pane label="表格视图" name="table">
        <SimpleTable :list="responseTable.list" :columns="columns" />
        <PaginationBar
          v-if="showPagination"
          :pagination="pagination"
          @page-change="$emit('page-change', $event)"
          @size-change="$emit('size-change', $event)"
        />
      </el-tab-pane>

      <el-tab-pane label="JSON 视图" name="json">
        <div class="json-tools">
          <el-button size="mini" @click="copyJson">复制 JSON</el-button>
        </div>
        <pre class="json-block">{{ formattedJson || '暂无返回数据' }}</pre>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import SimpleTable from './SimpleTable.vue'
import PaginationBar from './PaginationBar.vue'
import { generateColumns } from '../utils/responseParser'

export default {
  name: 'ResultCard',
  components: { SimpleTable, PaginationBar },
  props: {
    activeResultMode: String,
    responseTable: {
      type: Object,
      required: true
    },
    formattedJson: String,
    error: String,
    statusCode: [Number, String],
    responseTime: {
      type: Number,
      default: 0
    },
    showPagination: Boolean,
    pagination: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localMode: this.activeResultMode
    }
  },
  computed: {
    columns() {
      return generateColumns(this.responseTable.list)
    }
  },
  watch: {
    activeResultMode(next) {
      this.localMode = next
    }
  },
  methods: {
    onModeChange() {
      this.$emit('update:activeResultMode', this.localMode)
    },
    async copyJson() {
      if (!this.formattedJson) return
      try {
        await navigator.clipboard.writeText(this.formattedJson)
        this.$message.success('JSON 已复制')
      } catch (e) {
        this.$message.error('复制失败，请手动复制')
      }
    }
  }
}
</script>

<style scoped>
.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ok {
  color: #2a9f46;
  font-weight: 600;
}

.fail {
  color: #de3f3f;
  font-weight: 600;
}

.json-tools {
  margin-bottom: 8px;
}

.json-block {
  background: #f8fafc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}
</style>
