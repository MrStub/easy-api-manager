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
export default {
  name: 'PaginationBar',
  props: {
    pagination: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024
    }
  },
  computed: {
    isMobile() {
      return this.viewportWidth <= 768
    },
    paginationLayout() {
      return this.isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next'
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
