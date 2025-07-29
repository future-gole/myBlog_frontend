<template>
  <RouterLink :to="`/article/${post.id}`" class="polaroid" :style="{ transform: `rotate(${rotation}deg)` }">
    <img :src="post.image" :alt="post.title" class="aspect-[4/3] object-cover bg-gray-100">
    <p class="caption">{{ post.title }}</p>
  </RouterLink>
</template>
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
defineProps({ post: { type: Object, required: true } })
const rotation = ref((Math.random() - 0.5) * 6)
</script>