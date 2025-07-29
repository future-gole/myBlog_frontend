import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/archive', name: 'archive', component: () => import('../views/ArchiveView.vue') },
    { path: '/graph', name: 'graph', component: () => import('../views/GraphView.vue') },
    { path: '/article/:id', name: 'article', component: () => import('../views/ArticleView.vue'), props: true },
    { path: '/admin', name: 'admin', component: () => import('../views/Admin/AdminPanelView.vue') }
  ]
})

export default router