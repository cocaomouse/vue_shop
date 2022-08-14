import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  // 重定向路由规则
  {
    path:'/',
    redirect: '/login'
  },
  // 登录路由规则
  { 
    path: '/login',
    component: Login
  },
  // home路由规则
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    // 定义子路由规则 welcome
    children:[
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to,from,next) => {
   // to 将要访问的路径
   // from 代表从哪个路径跳转而来
   // next 是一个函数,表示放行

   // next() 放行
   // next('/login') 强制跳转 /login
   if (to.path === '/login') return next();
   // 获取token
   const tokenStr = window.sessionStorage.getItem('token');
   if (!tokenStr) return next('/login');
   next();
})

export default router
