<template>
  <div class="page relative overflow-hidden">
    <!-- 动态背景 -->
    <DynamicBackground />
    
    <!-- 主页面内容 -->
    <div class="relative z-10">
      <TheHeader />
      
      <!-- 英雄区域 - 已用Tailwind替换 -->
      <section class="relative px-6 py-24 md:py-32 flex flex-col items-center text-center min-h-[60vh]">
        <div class="w-full max-w-3xl flex flex-col items-center">
          <!-- 主标题 -->
          <div class="mb-6">
            <h1 
              class="font-handwriting font-bold text-[clamp(2.5rem,6vw,3.5rem)] leading-tight opacity-0 translate-y-5 transition-all duration-700" 
              :class="{ 'opacity-100 translate-y-0': isLoaded }"
              style="color:var(--color-fg)"
            >
              欢迎来到doublez的小屋
            </h1>
            <div class="h-0.5 w-20 rounded bg-[var(--color-accent)] origin-left scale-x-0 transition-transform duration-700 delay-300 mb-10" :class="{ 'scale-x-100': isLoaded }"></div>
          </div>
          
            <!-- 副标题 -->
          <div class="mb-12 opacity-0 translate-y-4 transition-all duration-700 delay-200" :class="{ 'opacity-100 translate-y-0': isLoaded }">
            <p class="text-xl md:text-2xl font-display leading-relaxed" style="color:var(--color-fg-subtle)">
              一个存放知识、梦想与慢生活的地方
            </p>
          </div>
          
          <!-- 欢迎标签 -->
          <div class="flex flex-wrap justify-center gap-4 mb-12 opacity-0 translate-y-4 transition-all duration-700 delay-300" :class="{ 'opacity-100 translate-y-0': isLoaded }">
            <span class="px-6 py-3 rounded-full text-base shadow-sm border backdrop-blur-sm bg-[color:var(--color-surface)/0.85] border-[var(--color-border)] text-[var(--color-fg)] transition-all hover:-translate-y-0.5 hover:shadow">🌱 慢生活</span>
            <span class="px-6 py-3 rounded-full text-base shadow-sm border backdrop-blur-sm bg-[color:var(--color-surface)/0.85] border-[var(--color-border)] text-[var(--color-fg)] transition-all hover:-translate-y-0.5 hover:shadow">📚 知识分享</span>
            <span class="px-6 py-3 rounded-full text-base shadow-sm border backdrop-blur-sm bg-[color:var(--color-surface)/0.85] border-[var(--color-border)] text-[var(--color-fg)] transition-all hover:-translate-y-0.5 hover:shadow">💭 思考感悟</span>
          </div>
          
          <!-- 滚动提示 -->
          <div class="mt-auto pt-4 opacity-0 transition-opacity duration-700 delay-500" :class="{ 'opacity-100': isLoaded }">
            <div class="text-sm mb-2 font-display" style="color:var(--color-fg-subtle)">向下探索</div>
            <div class="text-2xl text-[var(--color-accent)] animate-bounce">↓</div>
          </div>
        </div>
      </section>
      
      <!-- 近期文章区域 -->
      <section class="relative py-20 md:py-32">
        <div class="container mx-auto px-6">
          <!-- 区域标题 -->
          <div class="text-center mb-16">
            <h2 class="font-handwriting text-4xl md:text-5xl font-bold mb-4" style="color:var(--color-fg)">近日文章</h2>
            <div class="text-lg md:text-xl" style="color: var(--color-fg-subtle)">分享最近的思考与创作</div>
            <div class="mt-8">
              <div class="h-0.5 w-24 mx-auto rounded bg-[var(--color-accent)]"></div>
            </div>
          </div>
          
          <!-- 文章卡片 -->
          <div v-if="recentPosts.length" class="grid gap-12 md:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[1200px] mx-auto">
            <ArticleCard 
              v-for="(post, index) in recentPosts" 
              :key="post.id" 
              :post="post"
              :class="['opacity-0 translate-y-8', isLoaded ? 'animate-[slideIn_0.8s_ease-out_forwards]': '', `delay-${index}`]"
            />
          </div>
          
          <!-- 查看更多按钮 -->
          <div class="text-center mt-16">
            <RouterLink to="/archive" class="inline-flex items-center gap-3 px-8 py-4 rounded-full font-display font-semibold text-white bg-[var(--color-accent)] shadow-[0_4px_15px_rgba(244,146,109,0.30)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(244,146,109,0.40)] transition-all group">
              <span>查看所有文章</span>
              <span class="transition-transform group-hover:translate-x-1">→</span>
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

<style>
@keyframes slideIn { 0% { opacity: 0; transform: translateY(30px);} 100% {opacity:1; transform: translateY(0);} }
</style>
