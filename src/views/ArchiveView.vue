<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-5xl px-6 py-12">
      <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h1 class="text-5xl font-bold font-handwriting">所有文章</h1>
        <div class="flex items-center gap-4">
          <div id="view-switch" class="view-switch" :class="`${currentView}-active`">
            <div class="slider"></div>
            <button @click="setView('list')" :class="{ 'active': currentView === 'list' }">列表</button>
            <button @click="setView('gallery')" :class="{ 'active': currentView === 'gallery' }">画廊</button>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <button v-for="cat in blogStore.categories" :key="cat" @click="currentCategory = cat" class="torn-tag" :class="{ 'active': currentCategory === cat }">
          {{ cat }}
        </button>
      </div>
      <div id="posts-container">
        <div v-if="currentView === 'list'">
          <a v-for="post in filteredPosts" :key="post.id" :href="`#/article/${post.id}`" class="block py-6 border-b group" style="border-color:var(--border-color)">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-2xl font-handwriting font-bold group-hover:text-[var(--text-color-lighter)] transition-colors">{{ post.title }}</h3>
                <p class="mt-1" style="color:var(--text-color-light)">{{ post.date }} · {{ post.category }}</p>
              </div>
              <span class="group-hover:translate-x-2 transition-transform" style="color:var(--text-color-light)">→</span>
            </div>
          </a>
        </div>
        <div v-if="currentView === 'gallery'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ArticleCard v-for="post in filteredPosts" :key="post.id" :post="post" />
        </div>
        <p v-if="!filteredPosts.length" class="text-center py-10" style="color:var(--text-color-light)">这个分类下还没有文章哦。</p>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleCard from '@/components/ArticleCard.vue'
const blogStore = useBlogStore()
const currentView = ref('list')
const currentCategory = ref('全部')
const filteredPosts = computed(() => {
  if (currentCategory.value === '全部') return blogStore.posts
  return blogStore.posts.filter(p => p.category === currentCategory.value)
})
const setView = (view) => { currentView.value = view }
</script>