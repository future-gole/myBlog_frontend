<template>
  <button 
    @click="handleToggle" 
    class="fixed bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center transition-colors theme-switcher-btn"
    :style="{ backgroundColor: 'var(--switch-bg)', color: 'var(--text-color)' }"
    aria-label="切换主题"
  >
    <svg v-if="blogStore.theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  </button>
</template>
<script setup>
import { useBlogStore } from '@/store/blogStore'

const blogStore = useBlogStore()

const handleToggle = () => {
  console.log('Theme button clicked, current theme:', blogStore.theme)
  try {
    blogStore.toggleTheme()
    console.log('Theme toggled to:', blogStore.theme)
  } catch (error) {
    console.error('Error toggling theme:', error)
  }
}
</script>

<style scoped>
.theme-switcher-btn {
  z-index: 10000 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--border-color);
  cursor: pointer !important;
  pointer-events: auto !important;
  position: fixed !important;
}

.theme-switcher-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.theme-switcher-btn:active {
  transform: scale(0.95);
}

/* 确保在移动端也能正常点击 */
@media (max-width: 768px) {
  .theme-switcher-btn {
    bottom: 20px !important;
    right: 20px !important;
    width: 50px !important;
    height: 50px !important;
    z-index: 10001 !important;
  }
}

/* 强制覆盖任何可能的干扰样式 */
.theme-switcher-btn * {
  pointer-events: none;
}
</style>