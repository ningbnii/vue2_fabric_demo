// export const MINI_TIME = 500
// export const TIME_OUT_MAX = 10000
// console.log(process.env.NODE_ENV)
// export const host = 'https://drawing.api.sdningrun.com' // 生产环境
// export const local = 'https://drawing.api.sdningrun.com' // 本地环境
// export const fileHost = 'https://drawing.file.sdningrun.com/' // 文件域名
const ENV = process.env.NODE_ENV

const ENV_CONFIG = {
  // 开发环境
  development: {
    baseUrl: 'https://drawing.api.sdningrun.com',
    // fileHost: 'https://drawing.file.sdningrun.com/', // 文件服务
    fileHost: 'https://sdningrun-drawing.oss-cn-beijing.aliyuncs.com/', // 文件服务
  },
  //  生产环境
  production: {
    baseUrl: 'https://drawing.api.sdningrun.com',
    fileHost: 'https://sdningrun-drawing.oss-cn-beijing.aliyuncs.com/', // 文件服务
  },
}

export default {
  ...ENV_CONFIG[ENV],
}
