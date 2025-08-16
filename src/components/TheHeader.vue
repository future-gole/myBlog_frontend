<template>
  <header class="p-6 md:p-8 font-handwriting relative z-50">
    <div class="container mx-auto flex justify-between items-center">
      <RouterLink to="/" class="text-3xl font-bold">doublez小屋</RouterLink>
      
      <!-- 桌面端导航 -->
      <nav class="hidden md:flex space-x-8 text-lg items-center">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/archive" class="nav-link">所有文章</RouterLink>
        <RouterLink to="/graph" class="nav-link">关系图谱</RouterLink>
      </nav>
      
      <!-- 移动端汉堡菜单按钮 -->
      <button 
        @click="toggleMobileMenu" 
        class="md:hidden z-50 relative w-8 h-8 flex flex-col justify-center items-center space-y-1 transition-all duration-300"
        :class="{ 'transform rotate-90': isMobileMenuOpen }"
        aria-label="切换菜单"
      >
        <span 
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''"
        ></span>
        <span 
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="isMobileMenuOpen ? 'opacity-0' : ''"
        ></span>
        <span 
          class="block w-6 h-0.5 bg-current transition-all duration-300"
          :class="isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''"
        ></span>
      </button>
    </div>
    
    <!-- 移动端导航覆盖层 -->
    <div 
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden mobile-menu-backdrop"
      @click="closeMobileMenu"
    ></div>
    
    <!-- 移动端导航菜单 -->
    <nav 
      class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-40 md:hidden mobile-menu-panel"
      :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- 菜单头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">导航菜单</h3>
          <button 
            @click="closeMobileMenu" 
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="关闭菜单"
          >
            <span class="text-2xl">×</span>
          </button>
        </div>
      </div>
      
      <!-- 菜单内容 -->
      <div class="p-6">
        <ul class="space-y-6">
          <li>
            <RouterLink 
              to="/" 
              @click="closeMobileMenu"
              class="mobile-nav-link flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span class="text-2xl">🏠</span>
              <span class="text-lg">首页</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/archive" 
              @click="closeMobileMenu"
              class="mobile-nav-link flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span class="text-2xl">📚</span>
              <span class="text-lg">所有文章</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/graph" 
              @click="closeMobileMenu"
              class="mobile-nav-link flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span class="text-2xl">🕸️</span>
              <span class="text-lg">关系图谱</span>
            </RouterLink>
          </li>
        </ul>
        
        <!-- 分割线 -->
        <div class="my-8 border-t border-gray-200 dark:border-gray-700"></div>
        
        <!-- 额外信息 -->
        <div class="text-center text-sm opacity-70">
          <p>📝 记录生活，分享思考</p>
          <p class="mt-2">🌱 慢生活的美好时光</p>
        </div>
      </div>
    </nav>
  </header>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 防止背景滚动
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 监听窗口大小变化，桌面端时自动关闭移动菜单
const handleResize = () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// 监听ESC键关闭菜单
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
  // 清理可能的样式
  document.body.style.overflow = ''
})
</script>