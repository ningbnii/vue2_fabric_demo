import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
// import Pages from '@/pages/index.js'

// 解决重复点击导航路由报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}

Vue.use(Router)

const routes = [
  {
    path: '/',
    // redirect: '/index',
    component: () => import('@/pages/index.vue'),
  },
]

importPages(require.context('@/pages', true, /.vue$/, 'lazy'))

function importPages(r) {
  r.keys().forEach((key) => {
    routes.push({
      path: key.split('.')[1],
      component: (resolve) => {
        r(key).then((module) => {
          resolve(module)
        })
      },
    })
  })
}

const router = new Router({
  mode: process.env.NODE_ENV == 'development' ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes: routes,
})

router.beforeEach((to, from, next) => {
  // 第一次进入页面，存储进入的url
  if (
    location.href.indexOf('stack-key') != -1 &&
    !sessionStorage.getItem('firstEnterUrl')
  ) {
    sessionStorage.setItem('firstEnterUrl', location.href)
  }
  // 如果进入的的url是首页，则设置setTabBarActive为0，如果是community/index,则设置为1
  // 调用vuex的方法，设置tabbar的active
  if (to.path == '/') {
    store.commit('setTabBarActive', 0)
    // } else if (to.path == '/community/index') {
    //   store.commit('setTabBarActive', 2)
  } else if (to.path == '/home') {
    store.commit('setTabBarActive', 2)
  }
  next()
})

export default router
