<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="card-title">请求参数</div>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="sub-title">JSON 输入</div>
        <JsonEditor :value="jsonText" :rows="9" @input="$emit('update:jsonText', $event)" />
        <div class="hint">粘贴 JSON 后自动解析参数</div>
      </el-col>
      <el-col :span="12">
        <div class="sub-title">解析结果（{{ params.length }} 个参数）</div>
        <el-table :data="params" border empty-text="暂无参数">
          <el-table-column prop="name" label="参数名" min-width="120" />
          <el-table-column prop="value" label="值" min-width="140">
            <template slot-scope="scope">{{ formatValue(scope.row.value) }}</template>
          </el-table-column>
          <el-table-column prop="type" label="类型" min-width="120" />
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import JsonEditor from './JsonEditor.vue'

export default {
  name: 'RequestParamsCard',
  components: { JsonEditor },
  props: {
    jsonText: String,
    params: {
      type: Array,
      default: () => []
    }
  },
  methods: {
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
</style>
