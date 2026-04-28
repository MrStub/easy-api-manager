<template>
  <div class="pagination-wrap">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="$emit('page-change', $event)"
      @size-change="$emit('size-change', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    pagination: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.pagination-wrap {
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
