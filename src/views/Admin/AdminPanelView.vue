<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-5xl px-6 py-12">
      <!-- 现有的标题和Tab代码保持不变 -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-handwriting">发布新文章</h1>
      </div>

      <div class="mb-4 border-b border-[var(--color-border)] flex">
        <button
            @click="isPreviewing = false"
            :class="['tab-button', { 'active-tab': !isPreviewing }]"
        >
          编辑
        </button>
        <button
            @click="isPreviewing = true"
            :class="['tab-button', { 'active-tab': isPreviewing }]"
        >
          预览
        </button>
      </div>

      <!-- 编辑表单 -->
      <form v-if="!isPreviewing" @submit.prevent="submitPost" class="space-y-6">
        <!-- 标题 -->
        <div>
          <label class="block text-sm font-bold mb-2">标题</label>
          <input v-model="form.title" type="text" required
                 class="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/60 transition-colors"/>
        </div>
        <!-- 分类 -->
        <div class="space-y-2">
          <label class="block text-sm font-bold">分类</label>
          <select v-model="form.category" @change="onCategoryChange"
                  class="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-fg)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/60 transition-colors">
            <option v-for="cat in blogStore.categories.filter(c => c !== '全部')" :key="cat" :value="cat">{{ cat }}</option>
            <option value="new-category">（新建分类）</option>
          </select>
          <input v-if="isNewCategory" v-model="newCategory" type="text" placeholder="输入新分类名"
                 class="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/60 transition-colors"/>
        </div>
        <!-- 内容 -->
        <div class="content-input-wrapper">
          <label class="block text-sm font-bold mb-2">内容 (使用 [[标题]] 来链接文章)</label>
          <div class="textarea-container" ref="textareaContainer">
            <textarea ref="textareaRef" v-model="form.content" @paste="handlePaste" @input="handleInput" @keydown="handleKeydown" @click="handleTextareaClick" rows="20" required
                      class="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-4 py-3 leading-relaxed font-mono text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]/60 transition-colors resize-y"></textarea>

            <!-- 文章链接选择器 -->
            <ArticleLinkSelector
                ref="linkSelectorRef"
                :is-visible="linkSelector.isVisible"
                :search-text="linkSelector.searchText"
                :posts="blogStore.posts"
                :position="linkSelector.position"
                @select="handleLinkSelect"
                @cancel="handleLinkCancel"
            />
          </div>
        </div>
        <div>
          <button type="submit" class="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold py-2 px-6 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/60 transition">发布文章</button>
        </div>
      </form>

      <!-- 预览区域保持不变 -->
      <article v-else class="preview-area">
        <header class="text-center mb-12">
          <h1 class="text-5xl font-bold font-handwriting">{{ form.title || '文章标题' }}</h1>
        </header>
        <div
            ref="previewContainerRef"
            class="markdown-content line-numbers"
            v-html="previewHtml"
        ></div>
        <div class="mt-8 text-center">
          <button @click="isPreviewing = false" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">
            返回编辑
          </button>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleLinkSelector from '@/components/ArticleLinkSelector.vue' // 新增导入

// 现有的导入保持不变
import { marked } from 'marked'
import Prism from '@/utils/prism.js'
import { uploadImage } from "@/services/postsAPI.js"

const IMAGE_BASE_URL = '/images/'
const blogStore = useBlogStore()
const router = useRouter()

// 现有的响应式数据保持不变
const form = reactive({
  title: '',
  category: blogStore.categories[1] || '',
  image: '',
  content: ''
})
const isNewCategory = ref(false)
const newCategory = ref('')
const isPreviewing = ref(false)
const previewContainerRef = ref(null)
const textareaRef = ref(null)
const textareaContainer = ref(null)
const linkSelectorRef = ref(null)

// 新增：链接选择器状态
const linkSelector = reactive({
  isVisible: false,
  searchText: '',
  position: { top: 0, left: 0 },
  startPos: 0, // 记录 [[ 的开始位置
  currentPos: 0 // 记录当前光标位置
})

// 现有的 marked 配置和 previewHtml 计算属性保持不变
marked.use({
  breaks: true,
  gfm: true
});
marked.setOptions({
  highlight: function(code, language) {
    if (!language) language = 'plaintext';
    const validLanguage = Prism.languages[language] ? language : 'plaintext';
    try {
      return Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
    } catch (e) {
      console.warn('代码高亮失败:', e);
      return code;
    }
  }
});

const previewHtml = computed(() => {
  if (!form.content) {
    return '<p class="text-center text-gray-500 py-8">在编辑区域输入一些 Markdown 内容来查看预览...</p>'
  }

  // 创建一个更精确的映射：标题 -> 文章数组（处理同名情况）
  const titleToPostsMap = new Map()
  blogStore.posts.forEach(post => {
    const title = post.title
    if (!titleToPostsMap.has(title)) {
      titleToPostsMap.set(title, [])
    }
    titleToPostsMap.get(title).push(post)
  })

  // 处理内部链接，支持 [[标题]] 和 [[分类/标题]] 两种格式
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const linkedContent = form.content.replace(linkRegex, (match, linkText) => {
    // 检查是否包含分类信息
    if (linkText.includes('/')) {
      const [category, title] = linkText.split('/', 2)
      const post = blogStore.posts.find(p => p.title === title && p.category === category)
      if (post) {
        return `<a href=\"#/article/${post.id}\" class=\"font-bold text-[var(--accent-color)] border-b-2 border-transparent hover:border-[var(--accent-color)] transition-colors\" target=\"_blank\">${title}</a>`
      }
      return `<span class=\"line-through cursor-not-allowed text-[var(--color-fg-muted)]\">${linkText}</span>`
    } else {
      // 只有标题的情况
      const posts = titleToPostsMap.get(linkText)
      if (posts && posts.length > 0) {
        if (posts.length === 1) {
          // 只有一篇文章，直接链接
          return `<a href=\"#/article/${posts[0].id}\" class=\"font-bold text-[var(--accent-color)] border-b-2 border-transparent hover:border-[var(--accent-color)] transition-colors\" target=\"_blank\">${linkText}</a>`
        } else {
          // 多篇同名文章，显示为模糊链接并提示
          return `<span class=\"text-[var(--color-fg-muted)]\" title=\"存在多篇同名文章，请使用 [[分类/标题]] 格式\">${linkText}</span>`
        }
      }
      return `<span class=\"line-through cursor-not-allowed text-[var(--color-fg-muted)]\">${linkText}</span>`
    }
  })

  try {
    return marked.parse(linkedContent)
  } catch (e) {
    console.error('Markdown 解析失败:', e)
    return `<p>内容解析失败</p>`
  }
})

// 监听预览状态变化
watch(isPreviewing, (isNowPreviewing) => {
  if (isNowPreviewing) {
    nextTick(() => {
      if (previewContainerRef.value) {
        Prism.highlightAllUnder(previewContainerRef.value)
      }
    })
  }
})

// 新增：处理输入事件，检测 [[ 输入
const handleInput = (event) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const cursorPos = textarea.selectionStart
  const content = form.content

  // 检查是否刚输入了第二个 [
  if (content[cursorPos - 1] === '[' && content[cursorPos - 2] === '[') {
    // 显示链接选择器
    showLinkSelector(cursorPos - 2)
  } else if (linkSelector.isVisible) {
    // 如果选择器可见，更新搜索文本
    updateLinkSelectorSearch(cursorPos)
  }
}

// 显示链接选择器
const showLinkSelector = (startPos) => {
  const textarea = textareaRef.value
  if (!textarea) return

  // 计算选择器位置
  const rect = textarea.getBoundingClientRect()
  const containerRect = textareaContainer.value.getBoundingClientRect()

  // 简单的位置计算，你可能需要更精确的计算
  linkSelector.position = {
    top: rect.top - containerRect.top + 60, // 大概在当前行下方
    left: rect.left - containerRect.left + 20
  }

  linkSelector.startPos = startPos
  linkSelector.currentPos = startPos + 2
  linkSelector.searchText = ''
  linkSelector.isVisible = true
}

// 更新链接选择器的搜索文本
const updateLinkSelectorSearch = (cursorPos) => {
  const content = form.content
  const searchStart = linkSelector.startPos + 2 // 跳过 [[

  // 检查是否输入了 ]]，如果是则关闭选择器
  if (content[cursorPos - 1] === ']' && content[cursorPos - 2] === ']') {
    linkSelector.isVisible = false
    return
  }

  // 检查是否移动到了 [[ 之前，如果是则关闭选择器
  if (cursorPos < searchStart) {
    linkSelector.isVisible = false
    return
  }

  // 提取搜索文本
  linkSelector.searchText = content.substring(searchStart, cursorPos)
  linkSelector.currentPos = cursorPos
}

// 处理键盘事件
const handleKeydown = (event) => {
  if (linkSelector.isVisible && linkSelectorRef.value) {
    // 将键盘事件传递给链接选择器
    linkSelectorRef.value.handleKeydown(event)
  }
}

// 处理文本区域点击
const handleTextareaClick = () => {
  // 点击时关闭链接选择器
  if (linkSelector.isVisible) {
    linkSelector.isVisible = false
  }
}

// 处理链接选择
const handleLinkSelect = (post) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const content = form.content
  const beforeLink = content.substring(0, linkSelector.startPos)
  const afterLink = content.substring(linkSelector.currentPos)

  // 检查是否存在同名文章
  const sameNamePosts = blogStore.posts.filter(p => p.title === post.title)
  let linkText = post.title

  if (sameNamePosts.length > 1) {
    // 存在同名文章，使用 "分类/标题" 格式
    linkText = `${post.category}/${post.title}`
  }

  // 替换内容
  form.content = beforeLink + `[[${linkText}]]` + afterLink

  // 设置光标位置
  nextTick(() => {
    const newCursorPos = linkSelector.startPos + `[[${linkText}]]`.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })

  linkSelector.isVisible = false
}

// 处理链接选择取消
const handleLinkCancel = () => {
  linkSelector.isVisible = false
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// 现有的其他函数保持不变
const onCategoryChange = () => {
  isNewCategory.value = form.category === 'new-category'
}

const handlePaste = (event) => {
  const items = (event.clipboardData || window.clipboardData).items
  let file = null

  for (const item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      file = item.getAsFile()
      break
    }
  }

  if (file) {
    event.preventDefault()
    uploadImageAndInsertMarkdown(file)
  }
}

const uploadImageAndInsertMarkdown = async (file) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const placeholder = `![Uploading ${file.name}...]()`
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const currentContent = form.content
  form.content = currentContent.substring(0, startPos) + placeholder + currentContent.substring(endPos)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('articleId', '0')

  try {
    const relativePath = await uploadImage(formData)
    const fullUrl = `${IMAGE_BASE_URL}${relativePath}`.replace(/\/\//g, '/');
    const markdownImage = `![${file.name}](${fullUrl})`;
    form.content = form.content.replace(placeholder, markdownImage);
  } catch (error) {
    console.error('Image upload failed:', error);
    alert('图片上传失败！');
    form.content = form.content.replace(placeholder, `![Image upload failed]`);
  }
}

const submitPost = async () => {
  let finalCategory = form.category;
  if (isNewCategory.value) {
    if (!newCategory.value.trim()) { alert('新分类名不能为空！'); return; }
    finalCategory = newCategory.value.trim();
  }

  const newPostData = {
    title: form.title,
    category: finalCategory,
    image: form.image || `https://placehold.co/400x300/cccccc/fdfaf6?text=${encodeURIComponent(form.title)}`,
    content: form.content,
    tags: []
  };

  try {
    const createdPost = await blogStore.addPost(newPostData);
    alert('发布成功！');
    router.push(`/article/${createdPost.id}`);
  } catch (error) {
    console.error('发布失败:', error);
    alert('发布失败，请查看控制台');
  }
}
</script>

<style scoped>
/* 现有样式保持不变 */
.container {
  max-width: 900px;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s ease-in-out;
  color: var(--color-fg-subtle);
}

.tab-button:hover {
  color: var(--color-accent);
}

.tab-button.active-tab {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.preview-area {
  padding: 1rem 0;
}

/* 新增样式 */
.content-input-wrapper {
  position: relative;
}

.textarea-container {
  position: relative;
}
</style>
