<template>
  <header class="p-6 md:p-8 font-handwriting">
    <div class="container mx-auto flex justify-between items-center">
      <RouterLink to="/" class="text-3xl font-bold">doublez小屋</RouterLink>
      <nav class="hidden md:flex space-x-8 text-lg items-center">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/archive" class="nav-link">所有文章</RouterLink>
        <RouterLink to="/graph" class="nav-link">关系图谱</RouterLink>
      </nav>
    </div>
  </header>
</template>
<script setup>
import { RouterLink } from 'vue-router'
</script>