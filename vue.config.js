const CompressionPlugin = require('compression-webpack-plugin')
// const webpack = require('webpack');

// 如果线上是二级目录，比如list/index.html，那么就需要在这里配置
// const BASE_URL = process.env.NODE_ENV === 'production' ? '/list/' : '/'
const BASE_URL = process.env.NODE_ENV === 'production' ? '/' : '/'

module.exports = {
  // 基本路径（相对于服务器根目录，静态资源的相对路径）,根据环境不同进行切换
  publicPath: BASE_URL,
  // 打包时，不要map文件
  productionSourceMap: false,
  // 输入文件目录
  outputDir: 'dist',
  // 是否在保存的时候检查
  lintOnSave: false,
  // 放置生成的静态资源的目录（js，css，img，font），相对于outputDir
  assetsDir: 'static',

  configureWebpack: {
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios',
      qs: 'Qs',
    },
    plugins: [
      // gzip 压缩配置
      new CompressionPlugin({
        test: /\.js$|\.html$|\.css$/, // 匹配文件名
        threshold: 1024, // 对超过10kb的数据进行压缩
        deleteOriginalAssets: false, // 是否删除源文件
      }),
    ],
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "@/style/settings/var.scss";
          @import "@/style/tools/_sassMagic.scss";
          `,
      },
      postcss: {
        postcssOptions: (loaderContext) => {
          return {
            plugins: [
              [
                'postcss-px-to-viewport',
                {
                  unitToConvert: 'px', // 需要转换的单位，默认为"px"
                  // vant px转vw
                  viewportWidth: loaderContext.resourcePath.includes('vant')
                    ? 375
                    : 750, // 设计稿的视窗宽度
                  unitPrecision: 5, // 单位转换后保留的精度
                  //propList: ['*', '!font*'] 不匹配 font 开头的属性
                  propList: ['*'], // 能转化为 vw 的属性列表
                  viewportUnit: 'vw', // 希望使用的视窗单位
                  fontViewportUnit: 'vw', // 字体使用的视窗单位
                  selectorBlackList: [
                    '.nav-bar-top',
                    '.comment-sticky',
                    '.nav-bar-top2',
                    '.info-box',
                    '.progress',
                    '.my-tabs',
                    '.own-list',
                  ], // 需要忽略的 CSS 选择器，不会转为视窗单位，使用原有的 px 等单位
                  minPixelValue: 1, // 设置最小的转换数值，如果为 1 的话，只有大于 1 的值会被转换
                  mediaQuery: false, // 媒体查询里的单位是否需要转换单位
                  replace: true, // 是否直接更换属性值，而不添加备用属性
                  exclude: undefined, // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
                  include: /\/src\//, // 如果设置了include，那将只有匹配到的文件才会被转换
                  landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件
                  landscapeUnit: 'vw', // 横屏时使用的单位
                  landscapeWidth: 1125, // 横屏时使用的视窗宽度
                },
              ],
            ],
          }
        },
      },
    },
  },
  devServer: {
    hot: true, //自动保存
    open: false, //自动启动
    port: 8080, //默认端口号
    host: '0.0.0.0',
  },
}
