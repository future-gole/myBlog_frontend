<template>
  <div class="page" style="height: 100vh; overflow: hidden;">
    <div class="absolute top-0 left-0 w-full p-4 z-10">
      <TheHeader />
      <div class="container mx-auto mt-6 font-handwriting">
        <h1 class="text-2xl font-bold">思绪地图</h1>
        <p class="text-md mt-1" style="color: var(--text-color-light);">点击下面的主题标签，探索不同的灵感星系。</p>
        <CategoryTags 
          v-model="activeCategory"
          :categories="blogStore.categories"
          :center-align="false"
          :show-scroll-hint="true"
          class="mt-4"
        />
      </div>
    </div>
    <GraphVisualization 
      v-if="blogStore.graphData.nodes.length"
      :nodes="blogStore.graphData.nodes"
      :links="blogStore.graphData.links"
      :active-category="activeCategory"
      class="absolute top-0 left-0"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import GraphVisualization from '@/components/GraphVisualization.vue'
import CategoryTags from '@/components/CategoryTags.vue'

const blogStore = useBlogStore()
const activeCategory = ref('全部')
</script>