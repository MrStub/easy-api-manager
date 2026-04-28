<template>
  <el-card shadow="never" class="card">
    <div slot="header" class="card-title">接口信息</div>
    <el-form label-position="top" class="api-form">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="接口名称">
            <el-select
              filterable
              allow-create
              default-first-option
              :value="apiName"
              placeholder="可输入或选择已有接口"
              @change="$emit('update:apiName', $event)"
            >
              <el-option v-for="item in apiOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="9">
          <el-form-item label="请求地址 URL">
            <el-input
              :value="url"
              placeholder="https://api.example.com/user/list"
              @input="$emit('update:url', $event)"
            />
          </el-form-item>
        </el-col>

        <el-col :span="4">
          <el-form-item label="请求方式">
            <el-select :value="method" @change="$emit('update:method', $event)">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="3">
          <el-form-item label="Content-Type（固定）">
            <el-input :value="contentType" disabled>
              <i slot="suffix" class="el-icon-lock" />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="actions">
        <el-button type="primary" :loading="loading" @click="$emit('send')">发送请求</el-button>
        <el-button @click="$emit('clear')">清空</el-button>
      </div>
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
    contentType: String,
    loading: Boolean
  }
}
</script>

<style scoped>
.card-title {
  font-size: 24px;
  font-weight: 600;
}

.actions {
  margin-top: 4px;
}
</style>
