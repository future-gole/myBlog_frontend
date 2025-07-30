<template>
  <div class="page">
    <TheHeader />
    <div v-if="loading" class="text-center py-12">正在加载文章...</div>
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>
    <article v-else-if="post" class="container mx-auto max-w-3xl px-6 py-12">
      <header class="text-center mb-12">
        <p class="text-lg mb-2" style="color:var(--text-color-lighter)">{{ post.category }}</p>
        <h1 class="text-5xl font-bold font-handwriting">{{ post.title }}</h1>
        <p class="text-md mt-4" style="color:var(--text-color-light)">发布于 {{ post.createdAt }}</p>
      </header>
      <!-- 关键：添加 markdown-content 类 -->
      <div
          class="markdown-content line-numbers"
          v-html="renderedContent"
          ref="contentRef"
      ></div>
      <hr class="my-16 border-t" style="border-color:var(--border-color)">
      <section class="text-center">
        <h2 class="text-3xl font-bold font-handwriting mb-8">思绪连接</h2>
        <MiniGraph :post-id="post.id" />
      </section>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect, nextTick } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import MiniGraph from '@/components/MiniGraph.vue'
import { getPostById } from '@/services/postsAPI.js'
import { marked } from 'marked'
import Prism from '@/utils/prism.js'

const props = defineProps({ id: { type: String, required: true } })
const blogStore = useBlogStore()
const contentRef = ref(null)

const post = ref(null)
const loading = ref(true)
const error = ref(null)

// ===== 修改点：使用兼容性更好的配置方式 =====
marked.use({
  breaks: true,
  gfm: true
});

marked.setOptions({
  highlight: function(code, language) {
    // 处理未指定语言的情况
    if (!language) language = 'plaintext';

    // 验证语言支持
    const validLanguage = Prism.languages[language] ? language : 'plaintext';

    try {
      return Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
    } catch (e) {
      console.warn('代码高亮失败:', e);
      return code; // 直接返回原始代码
    }
  }
});
// ===== 修改结束 =====

watchEffect(async () => {
  post.value = null
  loading.value = true
  error.value = null

  try {
    const postId = Number(props.id)
    if (isNaN(postId)) {
      throw new Error("无效的文章 ID")
    }
    post.value = await getPostById(postId)
  } catch (e) {
    console.error("获取文章失败:", e)
    error.value = "无法加载文章，请稍后再试。"
  } finally {
    loading.value = false
  }
})

const renderedContent = computed(() => {
  if (!post.value || !post.value.content) return ''

  const titleToIdMap = new Map(blogStore.posts.map(p => [p.title, p.id]))
  const linkRegex = /\[\[([^\]]+)\]\]/g

  // 先处理自定义链接
  const linkedContent = post.value.content.replace(linkRegex, (match, title) => {
    if (titleToIdMap.has(title)) {
      return `<a href="#/article/${titleToIdMap.get(title)}" class="internal-link">${title}</a>`
    }
    return `<span class="internal-link-broken">${title}</span>`
  })

  // 使用 marked 解析
  try {
    return marked.parse(linkedContent)
  } catch (e) {
    console.error('Markdown 解析失败:', e)
    return `<p>内容解析失败</p>`
  }
})

// 在内容更新后重新高亮代码
watchEffect(() => {
  if (post.value && contentRef.value) {
    nextTick(() => {
      Prism.highlightAllUnder(contentRef.value)
    })
  }
})
</script>