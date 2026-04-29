<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="card-title">接口信息</div>
    <el-form label-position="top" class="api-form">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <el-form-item label="接口名称">
            <el-select
              filterable
              :value="apiName"
              placeholder="可输入或选择已有接口"
              @change="$emit('update:apiName', $event)"
            >
              <el-option v-for="item in apiOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :md="10" :lg="10">
          <el-form-item label="请求地址 URL">
            <el-input
              :value="url"
              placeholder="https://api.example.com/user/list"
              @input="$emit('update:url', $event)"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :md="6" :lg="6">
          <el-form-item label="请求方式">
            <el-select :value="method" @change="$emit('update:method', $event)">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
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
    },
    url: String,
    method: String,
    loading: Boolean
  }
}
</script>

<style scoped>
.card-title {
  font-size: 24px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .card-title {
    font-size: 20px;
  }
}
</style>
