<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto px-6">
      <section class="h-[60vh] flex flex-col justify-center items-center text-center">
        <h1 class="text-5xl md:text-6xl font-bold font-handwriting leading-tight">
          欢迎来到doublez的小屋
        </h1>
        <p class="mt-6 text-xl md:text-2xl" style="color: var(--text-color-light)">
          一个存放温暖、梦想与慢生活的地方。
        </p>
      </section>
      <section class="py-16 md:py-24">
        <h2 class="text-3xl font-bold text-center mb-12 font-handwriting">小屋手记</h2>
        <div v-if="recentPosts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          <ArticleCard v-for="post in recentPosts" :key="post.id" :post="post" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleCard from '@/components/ArticleCard.vue'

const blogStore = useBlogStore()
const recentPosts = computed(() => blogStore.posts.slice(0, 3))
</script>
