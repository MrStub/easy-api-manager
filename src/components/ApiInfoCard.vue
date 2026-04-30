<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="card-title">接口信息</div>
    <el-form label-position="top" class="api-form">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="24" :md="12" :lg="12">
          <el-form-item label="接口名称">
            <el-select
              filterable
              :value="apiName"
              class="api-select"
              popper-class="api-select-popper"
              placeholder="可输入或选择已有接口"
              @change="$emit('update:apiName', $event)"
            >
              <el-option v-for="item in apiOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script>
export default {
  name: 'ApiInfoCard',
  props: {
    apiName: String,
    apiOptions: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.card-title {
  font-size: 24px;
  font-weight: 600;
}

.api-select {
  width: 100%;
}

.api-select :deep(.el-input__inner) {
  padding-right: 36px;
}

@media (max-width: 768px) {
  .card-title {
    font-size: 20px;
  }
}
</style>

<style>
.api-select-popper {
  min-width: 520px !important;
  max-width: min(90vw, 760px);
}

.api-select-popper .el-select-dropdown__item {
  height: auto;
  min-height: 34px;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
