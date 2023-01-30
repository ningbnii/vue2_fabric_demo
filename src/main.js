import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store/index'
import Cookies from 'js-cookie'
import VuePageStack from 'vue-page-stack'
import VConsole from 'vconsole'
import '@/assets/iconfont/iconfont'
import '@/assets/iconfont/iconfont.css'
import '@/style/index.scss'
import Mui from '@/components'
import LightTimeline from 'vue-light-timeline'

// import Navigation from 'vue-navigation'

let openid = Cookies.get('openid')
let debugOpenid = [
  'otR84wQTS1CHHMr98Tp37dapy8_s',
  'otR84wb-MdGvfqllKYPSDkQi9cO0',
]

if (debugOpenid.indexOf(openid) !== -1) {
  const vConsole = new VConsole()
}
// 传值到小程序
uni.postMessage({
  data: {
    openid: openid,
  },
})
// const vConsole = new VConsole()
Vue.config.productionTip = false
Vue.prototype.$scrollTop = 0
if (process.env.NODE_ENV == 'development') {
  Vue.use(router)
  // Vue.use(VuePageStack, { router })
} else {
  Vue.use(VuePageStack, { router })
}

Vue.use(Mui)
// Vue.use(Navigation, { router })
Vue.use(vant.Lazyload)
// 全局注册
Vue.use(vant.ImagePreview)
Vue.use(LightTimeline)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
