<template>
  <RouterLink :to="`/article/${post.id}`" 
    :style="{ transform: `rotate(${rotation}deg)` }"
    class="relative block bg-[var(--color-surface)] p-4 pb-14 border border-[var(--color-border)] shadow-sm transition-all duration-300 hover:scale-[1.05] hover:rotate-0 hover:shadow-md will-change-transform">
    <img :src="post.image" :alt="post.title" class="aspect-[4/3] w-full object-cover bg-gray-100" />
    <p class="absolute bottom-4 left-4 right-4 text-center text-lg font-display">{{ post.title }}</p>
  </RouterLink>
</template>
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
defineProps({ post: { type: Object, required: true } })
const rotation = ref((Math.random() - 0.5) * 6)
</script>