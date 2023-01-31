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
  next()
})

export default router
