import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/archive', name: 'archive', component: () => import('../views/ArchiveView.vue') },
    { path: '/graph', name: 'graph', component: () => import('../views/GraphView.vue') },
    { path: '/article/:id', name: 'article', component: () => import('../views/ArticleView.vue'), props: true },
    { path: '/login', name: 'login', component: () => import('../views/Admin/LoginView.vue') },
    { path: '/admin', name: 'admin', component: () => import('../views/Admin/AdminPanelView.vue') }
  ]
})

// 路由守卫：访问管理面板时检查登录状态
router.beforeEach((to, from, next) => {
  if (to.name === 'admin') {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

export default router