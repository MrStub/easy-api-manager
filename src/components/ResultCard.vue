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
        <div class="table-tools">
          <el-button size="mini" type="primary" plain :disabled="!exportRows.length" @click="exportExcel">导出 Excel</el-button>
        </div>
        <SimpleTable :list="responseTable.list" :columns="columns" :trade-name="tradeName" />
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
import { resolveFieldLabel } from '../utils/fieldMap'

export default {
  name: 'ResultCard',
  components: { SimpleTable, PaginationBar },
  props: {
    activeResultMode: String,
    responseTable: {
      type: Object,
      required: true
    },
    fullResponseTable: {
      type: Object,
      default: () => ({ list: [] })
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
    },
    tradeName: {
      type: String,
      default: 'query_ta_dividend'
    }
  },
  data() {
    return {
      localMode: this.activeResultMode,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024
    }
  },
  computed: {
    columns() {
      return generateColumns(this.responseTable.list, this.tradeName)
    },
    exportRows() {
      const fullList = this.fullResponseTable?.list
      if (Array.isArray(fullList) && fullList.length) return fullList
      return Array.isArray(this.responseTable?.list) ? this.responseTable.list : []
    }
  },
  watch: {
    activeResultMode(next) {
      this.localMode = next
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true })
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize)
    }
  },
  methods: {
    handleResize() {
      this.viewportWidth = window.innerWidth
    },
    isWechatBrowser() {
      if (typeof navigator === 'undefined') return false
      return /micromessenger/i.test(navigator.userAgent || '')
    },
    isMobileBrowser() {
      if (typeof navigator === 'undefined') return false
      return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '')
    },
    onModeChange() {
      this.$emit('update:activeResultMode', this.localMode)
    },
    fallbackCopyText(text) {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.focus()
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    },
    async copyJson() {
      if (!this.formattedJson) return
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.formattedJson)
        } else {
          const copied = this.fallbackCopyText(this.formattedJson)
          if (!copied) throw new Error('copy failed')
        }
        this.$message.success('JSON 已复制')
      } catch (e) {
        this.$message.error('复制失败，请手动复制')
      }
    },
    openWechatDownloadWindow() {
      const downloadWindow = window.open('', '_blank')
      if (downloadWindow) {
        downloadWindow.document.write('<p style="font-size:16px;line-height:1.8;padding:24px;">Excel 正在生成，请稍候...</p>')
      }
      return downloadWindow
    },
    async downloadBlob(blob, fileName, preparedWindow = null) {
      const nav = window.navigator
      if (nav.msSaveOrOpenBlob) {
        nav.msSaveOrOpenBlob(blob, fileName)
        return true
      }

      const urlApi = window.URL || window.webkitURL
      const url = urlApi.createObjectURL(blob)
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      if (preparedWindow && !preparedWindow.closed) {
        preparedWindow.location.href = url
      }

      setTimeout(() => {
        urlApi.revokeObjectURL(url)
      }, 10000)

      return true
    },
    normalizeExportValue(value) {
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return value
    },
    calcDisplayWidth(text) {
      return String(text || '').split('').reduce((sum, ch) => {
        return sum + (/[^\x00-\xff]/.test(ch) ? 2 : 1)
      }, 0)
    },
    isNestedValue(value) {
      return value && typeof value === 'object'
    },
    toParamRows(value) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).map((key) => ({
          paramName: key,
          paramLabel: resolveFieldLabel(this.tradeName, key, '--'),
          value: value[key]
        }))
      }
      return [{ value }]
    },
    toListRows(value) {
      if (!Array.isArray(value)) return []
      return value.map((item) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) return item
        return { value: item }
      })
    },
    sanitizeSheetName(raw) {
      const base = String(raw || 'Sheet').replace(/[\\/?*[\]:]/g, '_').slice(0, 31) || 'Sheet'
      return base
    },
    sanitizeFileName(raw) {
      return String(raw || '')
        .replace(/[\\/:*?"<>|]/g, '_')
        .replace(/\s+/g, '_')
        .slice(0, 80)
    },
    async exportExcel() {
      if (!this.exportRows.length) {
        this.$message.warning('暂无可导出的数据')
        return
      }
      const preparedWindow = this.isWechatBrowser() ? this.openWechatDownloadWindow() : null

      const XLSX = await import('xlsx-js-style')
      const wb = XLSX.utils.book_new()
      const usedSheetNames = new Set()
      let sheetCounter = 0

      const makeUniqueSheetName = (baseName) => {
        const seed = this.sanitizeSheetName(baseName) || 'Sheet'
        let name = seed
        let idx = 1
        while (usedSheetNames.has(name)) {
          const suffix = `_${idx}`
          name = `${seed.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`
          idx += 1
        }
        usedSheetNames.add(name)
        return name
      }

      const appendSheetForValue = (title, value, fixedName = '') => {
        let rows = []
        if (Array.isArray(value)) rows = this.toListRows(value)
        else if (this.isNestedValue(value)) rows = this.toParamRows(value)
        else rows = [{ value }]

        const cols = generateColumns(rows, this.tradeName)
        const sheetName = fixedName || makeUniqueSheetName(`${title}_${++sheetCounter}`)
        const aoa = [cols.map((col) => col.label)]
        const pendingLinks = []
        const childTasks = []

        rows.forEach((row, rowIdx) => {
          const outRow = []
          cols.forEach((col, colIdx) => {
            const cellValue = row[col.prop]
            if (this.isNestedValue(cellValue)) {
              const childName = makeUniqueSheetName(`${sheetName}_${col.label}_${rowIdx + 1}`)
              childTasks.push({
                title: `${sheetName}_${col.label}_${rowIdx + 1}`,
                value: cellValue,
                sheetName: childName
              })
              outRow.push('查看详情')
              pendingLinks.push({
                r: rowIdx + 1,
                c: colIdx,
                target: `#'${childName}'!A1`
              })
            } else {
              outRow.push(this.normalizeExportValue(cellValue))
            }
          })
          aoa.push(outRow)
        })

        const ws = XLSX.utils.aoa_to_sheet(aoa)
        const colsWidth = cols.map((col) => {
          const headerWidth = this.calcDisplayWidth(col.label || '')
          const bodyWidth = rows.reduce((max, row) => {
            const cellValue = row[col.prop]
            if (this.isNestedValue(cellValue)) return Math.max(max, 12)
            const text = String(this.normalizeExportValue(cellValue) || '')
            const lines = text.split('\n')
            const longest = lines.reduce((m, line) => Math.max(m, this.calcDisplayWidth(line)), 0)
            return Math.max(max, Math.min(60, longest))
          }, 8)
          return { wch: Math.min(60, Math.max(12, headerWidth + 2, bodyWidth + 2)) }
        })

        ws['!cols'] = colsWidth

        const maxRow = aoa.length - 1
        const maxCol = cols.length - 1
        for (let r = 0; r <= maxRow; r += 1) {
          for (let c = 0; c <= maxCol; c += 1) {
            const addr = XLSX.utils.encode_cell({ r, c })
            if (!ws[addr]) ws[addr] = { t: 's', v: '' }
            const baseStyle = {
              alignment: {
                wrapText: true,
                vertical: 'top',
                horizontal: 'left'
              }
            }
            if (r === 0) {
              ws[addr].s = {
                ...baseStyle,
                font: {
                  bold: true
                }
              }
            } else if (!ws[addr].s) {
              ws[addr].s = baseStyle
            } else {
              ws[addr].s = {
                ...ws[addr].s,
                alignment: {
                  wrapText: true,
                  vertical: 'top',
                  horizontal: 'left'
                }
              }
            }
          }
        }

        pendingLinks.forEach((link) => {
          const addr = XLSX.utils.encode_cell({ r: link.r, c: link.c })
          if (!ws[addr]) ws[addr] = { t: 's', v: '查看详情' }
          ws[addr].v = '查看详情'
          ws[addr].t = 's'
          ws[addr].l = { Target: link.target, Tooltip: '点击查看详情' }
          ws[addr].s = {
            font: {
              color: { rgb: '0563C1' },
              underline: true
            },
            alignment: {
              wrapText: true,
              vertical: 'top',
              horizontal: 'left'
            }
          }
        })
        XLSX.utils.book_append_sheet(wb, ws, sheetName)

        childTasks.forEach((task) => {
          appendSheetForValue(task.title, task.value, task.sheetName)
        })
        return sheetName
      }

      const rootTitle = this.tradeName || '返回结果'
      appendSheetForValue(rootTitle, this.exportRows)
      const tradePart = this.sanitizeFileName(this.tradeName || 'api_result') || 'api_result'
      const fileName = `${tradePart}_${Date.now()}.xlsx`
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      await this.downloadBlob(blob, fileName, preparedWindow)
      if (this.isWechatBrowser()) {
        this.$message.success('已触发下载；若微信内未自动下载，请右上角选择在浏览器打开后下载')
      } else {
        this.$message.success('Excel 导出成功')
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
  gap: 12px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
}

.meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
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

.table-tools {
  display: flex;
  justify-content: flex-end;
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

@media (max-width: 768px) {
  .card-title {
    font-size: 20px;
  }

  .table-tools {
    justify-content: flex-start;
  }
}
</style>
