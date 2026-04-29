<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="card-title">请求参数</div>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="sub-title">参数输入</div>
        <el-form label-position="top" size="small">
          <el-form-item
            v-for="item in queryConditions"
            :key="item.fieldName"
            :label="item.chineseName || item.fieldName"
            :required="item.required"
          >
            <el-date-picker
              v-if="item.inputType === 'date'"
              :value="queryForm[item.fieldName]"
              type="date"
              value-format="yyyyMMdd"
              format="yyyy-MM-dd"
              :placeholder="item.placeholder || '请选择日期'"
              style="width: 100%"
              @input="(v) => onFieldChange(item, v)"
            />
            <el-input
              v-else
              :value="showValue(queryForm[item.fieldName])"
              :placeholder="item.placeholder || `请输入${item.chineseName || item.fieldName}`"
              @input="(v) => onFieldChange(item, castValue(item, v))"
            />
          </el-form-item>
        </el-form>
        <div class="hint" v-if="!queryConditions.length">请先在上方选择接口，系统会自动加载该接口入参模板。</div>
      </el-col>
      <el-col :span="12">
        <div class="sub-title">参数预览（{{ params.length }} 个）</div>
        <el-table :data="params" border empty-text="暂无参数">
          <el-table-column prop="name" label="参数名" min-width="120" />
          <el-table-column prop="value" label="值" min-width="140">
            <template slot-scope="scope">{{ formatValue(scope.row.value) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" min-width="120" />
        </el-table>
        <div class="sub-title json-title">JSON 预览</div>
        <JsonEditor :value="jsonText" :rows="8" :readonly="true" />
      </el-col>
    </el-row>

    <div class="actions">
      <el-button type="primary" :loading="loading" @click="$emit('send')">发送请求</el-button>
      <el-button @click="$emit('clear')">清空</el-button>
    </div>
  </el-card>
</template>

<script>
import JsonEditor from './JsonEditor.vue'

export default {
  name: 'RequestParamsCard',
  components: { JsonEditor },
  props: {
    queryConditions: {
      type: Array,
      default: () => []
    },
    queryForm: {
      type: Object,
      default: () => ({})
    },
    jsonText: String,
    loading: Boolean,
    params: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onFieldChange(item, value) {
      this.$emit('update:field', {
        fieldName: item.fieldName,
        value
      })
    },
    castValue(item, value) {
      if (item.fieldType === 'Integer' || item.fieldType === 'Long') {
        if (value === '') return ''
        const n = Number(value)
        return Number.isNaN(n) ? value : n
      }
      return value
    },
    showValue(value) {
      if (value === null || value === undefined) return ''
      return String(value)
    },
    formatValue(value) {
      if (typeof value === 'object' && value !== null) return JSON.stringify(value)
      return value
    }
  }
}
</script>

<style scoped>
.card-title {
  font-size: 24px;
  font-weight: 600;
}

.sub-title {
  margin-bottom: 10px;
  font-size: 18px;
  color: #303133;
}

.hint {
  margin-top: 8px;
  color: #909399;
}

.json-title {
  margin-top: 12px;
}

.actions {
  margin-top: 16px;
}
</style>
