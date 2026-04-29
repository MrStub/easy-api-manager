<template>
  <el-input
    type="textarea"
    :rows="rows"
    :value="value"
    :placeholder="placeholder"
    :readonly="readonly"
    class="json-editor"
    @input="$emit('input', $event)"
  />
</template>

<script>
export default {
  name: 'JsonEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    rows: {
      type: Number,
      default: 10
    },
    placeholder: {
      type: String,
      default: '请输入 JSON'
    },
    readonly: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.json-editor :deep(.el-textarea__inner) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  line-height: 1.6;
}
</style>
