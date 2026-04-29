module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      maxAssetSize: 900 * 1024,
      maxEntrypointSize: 750 * 1024
    }
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  },
  devServer: {
    port: 8081,
    proxy: {
      '/proxy-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/proxy-api': ''
        }
      }
    }
  }
}
