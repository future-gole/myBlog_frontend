<template>
  <div class="page">
    <TheHeader />
    <!-- 添加一个加载中状态，提升用户体验 -->
    <div v-if="loading" class="text-center py-12">正在加载文章...</div>
    <!-- 渲染错误信息 -->
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>
    <!-- 确保 post 有数据后再渲染 -->
    <article v-else-if="post" class="container mx-auto max-w-3xl px-6 py-12">
      <header class="text-center mb-12">
        <p class="text-lg mb-2" style="color:var(--text-color-lighter)">{{ post.category }}</p>
        <h1 class="text-5xl font-bold font-handwriting">{{ post.title }}</h1>
        <p class="text-md mt-4" style="color:var(--text-color-light)">发布于 {{ post.createdAt }}</p>
      </header>
      <div class="text-lg leading-9" v-html="renderedContent"></div>
      <hr class="my-16 border-t" style="border-color:var(--border-color)">
      <section class="text-center">
        <h2 class="text-3xl font-bold font-handwriting mb-8">思绪连接</h2>
        <MiniGraph :post-id="post.id" />
      </section>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import MiniGraph from '@/components/MiniGraph.vue'
import { getPostById } from '@/services/postsAPI.js';
// 推荐安装一个 markdown 解析库，例如 marked
// npm install marked
import { marked } from 'marked';

const props = defineProps({ id: { type: String, required: true } }) // 路由参数通常是字符串，改为 String 更安全
const blogStore = useBlogStore()

// 1. 使用 ref 替代 computed 来存储异步获取的数据
const post = ref(null);
const loading = ref(true);
const error = ref(null);

// 2. 使用 watchEffect 来处理数据获取，它会立即执行，并在其依赖项（props.id）变化时重新执行
watchEffect(async () => {
  // 重置状态
  post.value = null;
  loading.value = true;
  error.value = null;

  try {
    // 确保 props.id 存在且是有效数字
    const postId = Number(props.id);
    if (isNaN(postId)) {
      throw new Error("无效的文章 ID");
    }
    // 3. await 等待异步函数完成，然后将结果赋值给 ref
    post.value = await getPostById(postId);
  } catch (e) {
    console.error("获取文章失败:", e);
    error.value = "无法加载文章，请稍后再试。";
  } finally {
    loading.value = false;
  }
});


const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return ''

  // 4. 创建查找表
  const titleToIdMap = new Map(blogStore.posts.map(p => [p.title, p.id]));
  const linkRegex = /\[\[([^\]]+)\]\]/g;

  // 5. 先替换自定义链接
  const linkedContent = post.value.content.replace(linkRegex, (match, title) => {
    if (titleToIdMap.has(title)) {
      // 在 Vue Router 中，推荐使用 <router-link>，但 v-html 中只能用 <a>
      // Nuxt 中可以使用 <NuxtLink>
      return `<a href="#/article/${titleToIdMap.get(title)}" class="internal-link">${title}</a>`;
    }
    return `<span class="internal-link-broken">${title}</span>`;
  });

  // 6. 使用 marked 解析 Markdown 内容，更稳健
  return marked.parse(linkedContent);
})
</script>