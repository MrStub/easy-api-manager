<template>
  <div>
    <div class="table-scroll">
      <el-table :data="list" border stripe style="width: 100%" empty-text="暂无数据">
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          min-width="140"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="col.prop === 'status'" :class="statusClass(scope.row[col.prop])">
              {{ formatStatus(scope.row[col.prop]) }}
            </span>
            <el-button
              v-else-if="isNestedValue(scope.row[col.prop])"
              type="text"
              size="mini"
              @click="openDetail(getDetailTitle(col, scope.row), scope.row[col.prop])"
            >
              查看详情
            </el-button>
            <span v-else>{{ showValue(scope.row[col.prop]) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="currentDetail.title" :visible.sync="detailVisible" :width="dialogWidth" @close="closeAll">
      <template v-if="isNestedValue(currentDetail.value)">
        <div class="table-scroll">
          <el-table :data="pagedDetailRows" border stripe empty-text="暂无数据">
            <el-table-column
              v-for="col in detailColumns"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              min-width="140"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-button
                  v-if="isNestedValue(scope.row[col.prop])"
                  type="text"
                  size="mini"
                  @click="openDetail(getDetailTitle(col, scope.row), scope.row[col.prop])"
                >
                  查看详情
                </el-button>
                <span v-else>{{ showValue(scope.row[col.prop]) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="detailRows.length > currentDetail.pagination.pageSize" class="detail-pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="currentDetail.pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="currentDetail.pagination.pageSize"
            :total="detailRows.length"
            @current-change="onDetailPageChange"
            @size-change="onDetailPageSizeChange"
          />
        </div>
      </template>
      <pre v-else class="detail-json">{{ fullValue(currentDetail.value) }}</pre>

      <span slot="footer">
        <el-button v-if="detailStack.length > 1" @click="goBack">返回上一层级</el-button>
        <el-button type="primary" @click="closeAll">关闭弹窗</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatStatusValue, generateColumns } from '../utils/responseParser'
import { isNestedValue as isNestedDataValue, toListRows, toParamRows } from '../utils/nestedData'
import viewportMixin from '../mixins/viewport'

export default {
  name: 'SimpleTable',
  mixins: [viewportMixin],
  props: {
    list: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    tradeName: {
      type: String,
      default: 'query_ta_dividend'
    }
  },
  data() {
    return {
      detailVisible: false,
      detailStack: []
    }
  },
  computed: {
    currentDetail() {
      const top = this.detailStack[this.detailStack.length - 1]
      return top || { title: '', value: null, pagination: { page: 1, pageSize: 10 } }
    },
    detailRows() {
      const value = this.currentDetail.value
      if (Array.isArray(value)) return toListRows(value)
      return toParamRows(value, this.tradeName)
    },
    detailColumns() {
      return generateColumns(this.detailRows, this.tradeName)
    },
    pagedDetailRows() {
      const start = (this.currentDetail.pagination.page - 1) * this.currentDetail.pagination.pageSize
      return this.detailRows.slice(start, start + this.currentDetail.pagination.pageSize)
    },
    dialogWidth() {
      return this.isMobile ? '95%' : '760px'
    }
  },
  methods: {
    formatStatus(value) {
      return formatStatusValue(value)
    },
    showValue(value) {
      if (value === null || value === undefined) return '--'
      if (Array.isArray(value)) return `数组（${value.length} 项）`
      if (typeof value === 'object') return `对象（${Object.keys(value).length} 个字段）`
      return value
    },
    isNestedValue(value) {
      return isNestedDataValue(value)
    },
    fullValue(value) {
      return JSON.stringify(value, null, 2)
    },
    getDetailTitle(column, row) {
      const name = row.paramLabel && row.paramLabel !== '--' ? row.paramLabel : (row.paramName || column.label)
      return `${name}详情`
    },
    openDetail(title, value) {
      this.detailStack.push({
        title,
        value,
        pagination: { page: 1, pageSize: 10 }
      })
      this.detailVisible = true
    },
    goBack() {
      this.detailStack.pop()
    },
    closeAll() {
      this.detailStack = []
      this.detailVisible = false
    },
    onDetailPageChange(page) {
      const top = this.detailStack[this.detailStack.length - 1]
      if (top) {
        top.pagination.page = page
      }
    },
    onDetailPageSizeChange(pageSize) {
      const top = this.detailStack[this.detailStack.length - 1]
      if (top) {
        top.pagination = { page: 1, pageSize }
      }
    },
    statusClass(value) {
      if (value === 1 || value === '1') return 'status-tag status-enabled'
      if (value === 0 || value === '0') return 'status-tag status-disabled'
      return ''
    }
  }
}
</script>

<style scoped>
.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
}

.status-enabled {
  color: #2a9f46;
  background: #e9f7ec;
}

.status-disabled {
  color: #de3f3f;
  background: #fdeeee;
}

.nested-value {
  color: #2563eb;
  cursor: pointer;
}

.detail-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

.detail-json {
  margin: 0;
  max-height: 520px;
  overflow: auto;
  padding: 14px;
  border: 1px solid #e5e9f2;
  border-radius: 6px;
  background: #f8fafc;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .detail-pagination {
    justify-content: center;
  }
}
</style>
