<template>
  <div>
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

    <el-dialog :title="detailTitle" :visible.sync="detailVisible" width="760px">
      <template v-if="isNestedValue(detailValue)">
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
        <div v-if="detailRows.length > detailPagination.pageSize" class="detail-pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="detailPagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="detailPagination.pageSize"
            :total="detailRows.length"
            @current-change="detailPagination.page = $event"
            @size-change="onDetailPageSizeChange"
          />
        </div>
      </template>
      <pre v-else class="detail-json">{{ fullValue(detailValue) }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { formatStatusValue, generateColumns } from '../utils/responseParser'
import { getFieldLabel } from '../utils/fieldMap'

const DEFAULT_TRADE_NAME = 'query_ta_dividend'

export default {
  name: 'SimpleTable',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      detailVisible: false,
      detailTitle: '',
      detailValue: null,
      detailPagination: {
        page: 1,
        pageSize: 10
      }
    }
  },
  computed: {
    detailRows() {
      if (Array.isArray(this.detailValue)) return this.toListRows(this.detailValue)
      return this.toParamRows(this.detailValue)
    },
    detailColumns() {
      return generateColumns(this.detailRows)
    },
    pagedDetailRows() {
      const start = (this.detailPagination.page - 1) * this.detailPagination.pageSize
      return this.detailRows.slice(start, start + this.detailPagination.pageSize)
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
      return value && typeof value === 'object'
    },
    toParamRows(value, parentPath = '') {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).map((key) => {
          const name = parentPath ? `${parentPath}.${key}` : key
          return this.toParamRow(name, key, value[key])
        })
      }

      return [
        {
          paramName: parentPath || 'value',
          paramLabel: getFieldLabel(DEFAULT_TRADE_NAME, 'value'),
          value
        }
      ]
    },
    toListRows(value) {
      if (Array.isArray(value)) {
        return value.map((item) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return item
          }
          return { value: item }
        })
      }
      return []
    },
    toParamRow(paramName, fieldName, value) {
      return {
        paramName,
        paramLabel: getFieldLabel(DEFAULT_TRADE_NAME, fieldName),
        value
      }
    },
    fullValue(value) {
      return JSON.stringify(value, null, 2)
    },
    getDetailTitle(column, row) {
      const name = row.paramLabel && row.paramLabel !== '--' ? row.paramLabel : (row.paramName || column.label)
      return `${name}详情`
    },
    openDetail(title, value) {
      this.detailTitle = title
      this.detailValue = value
      this.detailPagination = {
        page: 1,
        pageSize: 10
      }
      this.detailVisible = true
    },
    onDetailPageSizeChange(pageSize) {
      this.detailPagination = {
        page: 1,
        pageSize
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
</style>
