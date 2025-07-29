<template>
  <div id="app-shell">
    <!-- 独立的打字机开场 -->
    <TypingIntro v-if="!introFinished" @animation-finished="handleIntroFinish" />
    
    <!-- 主应用内容，在开场动画结束后显示 -->
    <template v-if="introFinished">
      <DynamicBackground />
      <RouterView v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
      <ThemeSwitcher />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useBlogStore } from './store/blogStore'
import TypingIntro from './components/TypingIntro.vue'
import DynamicBackground from './components/DynamicBackground.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

const introFinished = ref(false)
const blogStore = useBlogStore()

const handleIntroFinish = () => {
  introFinished.value = true;
}

onMounted(async () => {
  blogStore.loadTheme()
  await blogStore.loadInitialData()
})
</script>
