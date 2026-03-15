import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DiagnosisView from '../views/DiagnosisView.vue'
import ReportsView from '../views/ReportsView.vue'
import ReportDetailView from '../views/ReportDetailView.vue'
import AnalyticsView from '../views/AnalyticsView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/diagnosis',
    name: 'diagnosis',
    component: DiagnosisView
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView
  },
  {
    path: '/reports/detail/:id',
    name: 'reportDetail',
    component: ReportDetailView,
    props: true
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫，检查登录状态
router.beforeEach((to, _, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  
  // 如果不是前往登录页或注册页且未登录，则重定向到登录页
  if (to.path !== '/login' && to.path !== '/register' && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router 