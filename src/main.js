import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useBlogStore } from '@/store/blogStore'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 主题初始化
const blogStore = useBlogStore()
blogStore.loadTheme()

app.mount('#app')

