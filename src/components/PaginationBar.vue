<template>
  <div class="pagination-wrap">
    <el-pagination
      :background="!isMobile"
      :small="isMobile"
      :layout="paginationLayout"
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
import viewportMixin from '../mixins/viewport'

export default {
  name: 'PaginationBar',
  mixins: [viewportMixin],
  props: {
    pagination: {
      type: Object,
      required: true
    }
  },
  computed: {
    paginationLayout() {
      return this.isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next'
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

@media (max-width: 768px) {
  .pagination-wrap {
    justify-content: center;
  }
}
</style>
