<template>
  <div class="page">
    <TheHeader />
    <div v-if="loading" class="text-center py-12">正在加载文章...</div>
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>
    <article v-else-if="post" class="container mx-auto px-6 py-12">
      <!-- 文章标题 - 回到原始样式 -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-bold font-handwriting">{{ post.title }}</h1>
      </header>

      <!-- 三栏布局容器 -->
      <div class="article-layout">
        <!-- 左侧元信息栏 -->
        <aside class="left-sidebar">
          <div class="meta-section">
            <!-- 动态进度线 -->
            <div class="progress-line-container">
              <div class="progress-line">
                <div class="progress-fill" :style="{ height: readingProgress + '%' }"></div>
              </div>
              <div class="progress-dot" :style="{ top: readingProgress + '%' }"></div>
            </div>

            <!-- 元信息内容 -->
            <div class="meta-content">
              <div class="meta-row">
                <span class="meta-label">分类</span>
                <span class="category-badge">{{ post.category }}</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">发布时间</span>
                <span class="meta-value">{{ post.createdAt }}</span>
              </div>

              <div v-if="post.tags && post.tags.length > 0" class="meta-row tags-row">
                <span class="meta-label">标签</span>
                <div class="tags-list">
                  <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="tag-item"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 中间主内容区域 -->
        <main class="main-content">
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
        </main>

        <!-- 右侧目录导航 - 手机端隐藏 -->
        <aside class="right-sidebar">
          <div class="toc-container">
            <h3 class="toc-title">页面导航</h3>
            <nav class="toc-nav">
              <ul class="toc-list">
                <li
                    v-for="heading in tableOfContents"
                    :key="heading.id"
                    :class="['toc-item', `toc-level-${heading.level}`, { 'toc-active': activeHeading === heading.id }]"
                >
                  <a
                      :href="`#${heading.id}`"
                      class="toc-link"
                      @click.prevent="scrollToHeading(heading.id)"
                  >
                    {{ heading.text }}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </article>
    <!-- Lightbox 图片放大浮层 -->
    <div v-if="isLightboxVisible" class="lightbox-overlay" @click="closeLightbox">
      <img :src="lightboxImageUrl" alt="放大的图片" class="lightbox-image" @click.stop />
      <span class="lightbox-close">&times;</span>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, watchEffect, nextTick, onMounted, onUnmounted } from 'vue'
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
const tableOfContents = ref([])
const activeHeading = ref('')
const readingProgress = ref(0)

// Lightbox 相关的状态
const isLightboxVisible = ref(false)
const lightboxImageUrl = ref('')
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

// 生成目录
const generateTableOfContents = () => {
  if (!contentRef.value) return

  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc = []

  headings.forEach((heading, index) => {
    const id = `heading-${index}`
    heading.id = id

    toc.push({
      id,
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1))
    })
  })

  tableOfContents.value = toc
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 更新活跃标题
const updateActiveHeading = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let current = ''

  headings.forEach(heading => {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= 100) {
      current = heading.id
    }
  })

  activeHeading.value = current
}

// 更新阅读进度
const updateReadingProgress = () => {
  if (!contentRef.value) return

  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  const progress = (scrollTop / (documentHeight - windowHeight)) * 100
  readingProgress.value = Math.min(100, Math.max(0, progress))
}

// 在内容更新后重新高亮代码和生成目录
watchEffect(() => {
  if (post.value && contentRef.value) {
    nextTick(() => {
      Prism.highlightAllUnder(contentRef.value)
      generateTableOfContents()
    })
  }
})

// ===== 【新增】Lightbox 事件处理函数 =====

// 打开 Lightbox
const openLightbox = (imageUrl) => {
  lightboxImageUrl.value = imageUrl
  isLightboxVisible.value = true
  document.body.style.overflow = 'hidden' // 禁止背景滚动
}

// 关闭 Lightbox
const closeLightbox = () => {
  isLightboxVisible.value = false
  lightboxImageUrl.value = ''
  document.body.style.overflow = '' // 恢复背景滚动
}

// 内容区域的点击事件处理器 (事件委托)
const handleContentClick = (event) => {
  // 检查点击的是否是 IMG 标签
  if (event.target.tagName === 'IMG') {
    event.preventDefault() // 阻止可能的默认行为
    openLightbox(event.target.src)
  }
}

// 处理 Esc 键关闭
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isLightboxVisible.value) {
    closeLightbox()
  }
}

watch(contentRef, (newEl, oldEl) => {
  if (oldEl) {
    oldEl.removeEventListener('click', handleContentClick)
  }
  if (newEl) {
    newEl.addEventListener('click', handleContentClick)
  }
})

// 监听滚动事件
const handleScroll = () => {
  updateActiveHeading()
  updateReadingProgress()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown) // 【新增】监听键盘事件
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown) // 【新增】移除键盘监听
  document.body.style.overflow = '' // 【新增】确保组件卸载时恢复滚动
})
</script>

<style scoped>
/* 容器最大宽度调整，更好利用屏幕空间 */
.container {
  max-width: 1600px;
}

/* 三栏布局 - 电脑端优化空间利用 */
.article-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

/* 左侧边栏 - 固定宽度 */
.left-sidebar {
  flex: 0 0 300px;
  position: sticky;
  top: 2rem;
}

.meta-section {
  display: flex;
  gap: 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 动态进度线 */
.progress-line-container {
  position: relative;
  width: 6px;
  flex-shrink: 0;
}

.progress-line {
  width: 4px;
  height: 300px;
  background: var(--border-color);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  width: 100%;
  background: linear-gradient(to bottom, var(--accent-color), #ff8a65);
  border-radius: 2px;
  transition: height 0.3s ease;
  position: absolute;
  top: 0;
}

.progress-dot {
  position: absolute;
  left: -4px;
  width: 12px;
  height: 12px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(244, 146, 109, 0.6);
  transition: top 0.3s ease;
  transform: translateY(-50%);
}

/* 元信息内容 */
.meta-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-row {
  gap: 0.75rem;
}

.meta-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-color-lighter);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
}

.category-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--accent-color), #ff8a65);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(244, 146, 109, 0.3);
  transition: transform 0.2s ease;
  align-self: flex-start;
}

.category-badge:hover {
  transform: translateY(-2px);
}

.meta-value {
  color: var(--text-color-light);
  font-size: 0.9rem;
  font-family: 'Noto Serif SC', serif;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: rgba(244, 146, 109, 0.1);
  color: var(--accent-color);
  padding: 0.3rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(244, 146, 109, 0.2);
  transition: all 0.2s ease;
}

.tag-item::before {
  content: '#';
  margin-right: 0.25rem;
  opacity: 0.7;
}

.tag-item:hover {
  background: var(--accent-color);
  color: white;
  transform: translateY(-1px);
}

/* 主内容区域 - 更大的空间 */
.main-content {
  flex: 1;
  min-width: 0;
  max-width: 900px; /* 增加最大宽度 */
  padding: 0 2rem;
}

/* 右侧目录 - 固定宽度 */
.right-sidebar {
  flex: 0 0 280px;
  position: sticky;
  top: 2rem;
}

.toc-container {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.toc-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0.5rem;
}

.toc-link {
  display: block;
  color: var(--text-color-light);
  text-decoration: none;
  padding: 0.5rem 0;
  border-left: 3px solid transparent;
  padding-left: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
  transition: all 0.2s ease;
  border-radius: 0 0.375rem 0.375rem 0;
  word-wrap: break-word;
}

.toc-link:hover {
  color: var(--accent-color);
  background: rgba(244, 146, 109, 0.05);
  border-left-color: var(--accent-color);
  transform: translateX(4px);
}

.toc-active .toc-link {
  color: var(--accent-color);
  background: rgba(244, 146, 109, 0.1);
  border-left-color: var(--accent-color);
  font-weight: 600;
}

/* 不同级别的标题缩进 */
.toc-level-2 .toc-link { padding-left: 1.5rem; }
.toc-level-3 .toc-link { padding-left: 2rem; }
.toc-level-4 .toc-link { padding-left: 2.5rem; }
.toc-level-5 .toc-link { padding-left: 3rem; }
.toc-level-6 .toc-link { padding-left: 3.5rem; }

/* 【新增】让文章内的图片有可点击的提示 */
.markdown-content :deep(img) {
  cursor: zoom-in;
  transition: opacity 0.2s ease;
}
.markdown-content :deep(img:hover) {
  opacity: 0.85;
}

/* 【新增】Lightbox 样式 */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: zoom-out;
  padding: 2rem;
  box-sizing: border-box;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  cursor: default;
  animation: zoomIn 0.3s ease-out;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 2rem;
  font-size: 3rem;
  color: white;
  font-weight: 300;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.lightbox-close:hover {
  opacity: 0.7;
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 平板端适配 */
@media (max-width: 1200px) {
  .container {
    max-width: 1200px;
  }

  .article-layout {
    gap: 2rem;
  }

  .left-sidebar {
    flex: 0 0 280px;
  }

  .right-sidebar {
    flex: 0 0 260px;
  }

  .main-content {
    max-width: none;
    padding: 0 1rem;
  }
}

/* 手机端适配 - 隐藏导航栏，修复正文显示 */
@media (max-width: 768px) {
  .article-layout {
    display: block; /* 改为块级布局 */
  }

  .left-sidebar {
    position: static;
    width: 100%;
    margin-bottom: 2rem;
  }

  .meta-section {
    flex-direction: column;
    padding: 1rem;
  }

  .progress-line-container {
    display: none; /* 手机端隐藏进度线 */
  }

  .main-content {
    width: 100%;
    max-width: none;
    padding: 0;
    margin: 0;
  }

  .right-sidebar {
    display: none; /* 手机端隐藏导航栏 */
  }

  /* 手机端标题调整 */
  header h1 {
    font-size: 2.5rem !important;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .container {
    padding: 1rem;
  }

  header h1 {
    font-size: 2rem !important;
  }

  .meta-section {
    padding: 0.75rem;
  }

  .meta-content {
    gap: 1rem;
  }
}

/* 暗色主题适配 */
.dark .progress-dot {
  box-shadow: 0 0 20px rgba(246, 173, 85, 0.6);
}

.dark .category-badge {
  box-shadow: 0 2px 8px rgba(246, 173, 85, 0.3);
}

.dark .toc-container,
.dark .meta-section {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
</style>