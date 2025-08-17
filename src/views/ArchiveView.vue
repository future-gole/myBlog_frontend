<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-5xl px-6 py-12">
      <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h1 class="text-5xl font-bold font-handwriting">所有文章</h1>
        <div class="flex items-center gap-4">
          <!-- Rewritten view switcher -->
          <div class="relative flex rounded-full p-1 bg-[var(--color-border)] overflow-hidden text-sm font-semibold">
            <span class="absolute inset-y-1 left-1 w-1/2 rounded-full bg-[var(--color-surface)] shadow-sm transition-transform duration-300 will-change-transform"
              :style="{ transform: currentView === 'gallery' ? 'translateX(100%)' : 'translateX(0%)' }"></span>
            <button @click="setView('list')"
              class="relative z-10 px-4 py-1 transition-colors"
              :class="currentView === 'list' ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-subtle)]'">列表</button>
            <button @click="setView('gallery')"
              class="relative z-10 px-4 py-1 transition-colors"
              :class="currentView === 'gallery' ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-subtle)]'">画廊</button>
          </div>
        </div>
      </div>
      <!-- 标签筛选区域 -->
      <CategoryTags 
        v-model="currentCategory"
        :categories="blogStore.categories"
        :center-align="true"
        :show-scroll-hint="true"
        class="mb-12"
      />
      <div id="posts-container">
        <div v-if="currentView === 'list'">
          <a v-for="post in filteredPosts" :key="post.id" :href="`#/article/${post.id}`" class="block py-6 border-b group" style="border-color:var(--color-border)">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-2xl font-handwriting font-bold group-hover:text-[var(--color-fg-muted)] transition-colors">{{ post.title }}</h3>
                <p class="mt-1 text-[color:var(--color-fg-subtle)]">{{ post.date }} · {{ post.category }}</p>
              </div>
              <span class="group-hover:translate-x-2 transition-transform text-[color:var(--color-fg-subtle)]">→</span>
            </div>
          </a>
        </div>
        <div v-if="currentView === 'gallery'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ArticleCard v-for="post in filteredPosts" :key="post.id" :post="post" />
        </div>
        <p v-if="!filteredPosts.length" class="text-center py-10 text-[color:var(--color-fg-subtle)]">这个分类下还没有文章哦。</p>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import CategoryTags from '@/components/CategoryTags.vue'

const blogStore = useBlogStore()
const currentView = ref('list')
const currentCategory = ref('全部')

const filteredPosts = computed(() => {
  if (currentCategory.value === '全部') return blogStore.posts
  return blogStore.posts.filter(p => p.category === currentCategory.value)
})

const setView = (view) => { 
  currentView.value = view 
}
</script>