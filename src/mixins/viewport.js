export default {
  data() {
    return {
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024
    }
  },
  computed: {
    isMobile() {
      return this.viewportWidth <= 768
    }
  },
  mounted() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleViewportResize, { passive: true })
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleViewportResize)
    }
  },
  methods: {
    handleViewportResize() {
      this.viewportWidth = window.innerWidth
    }
  }
}
