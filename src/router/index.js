import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    // 重定向到welcome
    redirect: '/welcome',
    // 子路由
    children: [
      // 欢迎页
      {
        path: '/welcome',
        component: Welcome
      },
      // 用户列表页
      {
        path: '/users',
        component: Users
      },
      // 权限列表页
      {
        path: '/rights',
        component: Rights
      },
      // 角色列表页
      {
        path: '/roles',
        component: Roles
      },
      // 商品分类页
      {
        path: '/categories',
        component: Cate
      },
      // 商品参数页
      {
        path:'/params',
        component:Params
      },
      // 商品列表页面
      {
        path:'/goods',
        component:List,
      },
      // 添加商品页面
      { 
          path:'/goods/add',
          component:Add
      },
      // 订单列表页面
      {
        path:'/orders',
        component:Order
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()直接放行;next("/login")强制跳转
  if (to.path === '/login') return next()// 要去登录页就直接放行,去其它页面必须判断有无token
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')// 没有token强制跳转到 login 页面登录
  // 存在token直接放行去其它页面
  next()
})

export default router
