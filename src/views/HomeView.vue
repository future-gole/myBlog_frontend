<template>
  <div class="page relative overflow-hidden">
    <!-- 动态背景 -->
    <DynamicBackground />
    
    <!-- 主页面内容 -->
    <div class="relative z-10">
      <TheHeader />
      
      <!-- 英雄区域 - 简化版本 -->
      <section class="hero-section-simple relative">
        <!-- 主要内容 -->
        <div class="hero-content-simple relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
          <!-- 主标题 -->
          <div class="title-container-simple">
            <h1 class="hero-title-simple font-handwriting" :class="{ 'animate-fade-in-simple': isLoaded }">
              欢迎来到doublez的小屋
            </h1>
            <div class="title-underline-simple"></div>
          </div>
          
          <!-- 副标题 -->
          <div class="subtitle-container-simple" :class="{ 'animate-slide-up-simple': isLoaded }">
            <p class="hero-subtitle-simple">
              一个存放知识、梦想与慢生活的地方
            </p>
          </div>
          
          <!-- 欢迎标签 -->
          <div class="welcome-tags-simple" :class="{ 'animate-fade-in-delayed': isLoaded }">
            <span class="welcome-tag-simple">🌱 慢生活</span>
            <span class="welcome-tag-simple">📚 知识分享</span>
            <span class="welcome-tag-simple">💭 思考感悟</span>
          </div>
          
          <!-- 滚动提示 -->
          <div class="scroll-indicator-simple" :class="{ 'animate-pulse-simple': isLoaded }">
            <div class="scroll-text-simple">向下探索</div>
            <div class="scroll-arrow-simple">↓</div>
          </div>
        </div>
      </section>
      
      <!-- 近期文章区域 -->
      <section class="articles-section-simple py-20 md:py-32 relative">
        <div class="container mx-auto px-6">
          <!-- 区域标题 -->
          <div class="section-header-simple text-center mb-16">
            <h2 class="section-title-simple font-handwriting text-4xl md:text-5xl font-bold mb-4">
              近日文章
            </h2>
            <div class="section-subtitle-simple text-lg md:text-xl" style="color: var(--text-color-light)">
              分享最近的思考与创作
            </div>
            <div class="section-decoration-simple">
              <div class="decoration-line-simple"></div>
            </div>
          </div>
          
          <!-- 文章卡片 -->
          <div v-if="recentPosts.length" class="articles-grid-simple">
            <ArticleCard 
              v-for="(post, index) in recentPosts" 
              :key="post.id" 
              :post="post"
              :class="`animate-card-simple-${index + 1}`"
            />
          </div>
          
          <!-- 查看更多按钮 -->
          <div class="text-center mt-16">
            <RouterLink to="/archive" class="explore-button-simple">
              <span class="button-text">查看所有文章</span>
              <span class="button-arrow">→</span>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import DynamicBackground from '@/components/DynamicBackground.vue'

const blogStore = useBlogStore()
const recentPosts = computed(() => blogStore.posts.slice(0, 3))
const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 300)
})
</script>
