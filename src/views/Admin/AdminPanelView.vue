<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-5xl px-6 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-handwriting">发布新文章</h1>
      </div>

      <!-- 新增：编辑/预览切换 Tab -->
      <div class="mb-4 border-b border-[var(--border-color)] flex">
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

      <!-- 编辑表单 (v-if 控制) -->
      <form v-if="!isPreviewing" @submit.prevent="submitPost" class="admin-form space-y-6">
        <div>
          <label class="block text-sm font-bold mb-2">标题</label>
          <input v-model="form.title" type="text" class="w-full" required>
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">分类</label>
          <select v-model="form.category" @change="onCategoryChange" class="w-full">
            <option v-for="cat in blogStore.categories.filter(c => c !== '全部')" :key="cat" :value="cat">{{ cat }}</option>
            <option value="new-category">（新建分类）</option>
          </select>
          <input v-if="isNewCategory" v-model="newCategory" type="text" class="w-full mt-2" placeholder="输入新分类名">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">图片URL</label>
          <input v-model="form.image" type="text" class="w-full" placeholder="https://placehold.co/...">
        </div>
        <div>
          <label class="block text-sm font-bold mb-2">内容 (使用 [[标题]] 来链接文章)</label>
          <textarea v-model="form.content" rows="20" class="w-full" required></textarea>
        </div>
        <div>
          <button type="submit" class="bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-2 px-6 rounded">
            发布文章
          </button>
        </div>
      </form>

      <!-- 预览区域 (v-if 控制) -->
      <article v-else class="preview-area">
        <!-- 模拟文章详情页的标题 -->
        <header class="text-center mb-12">
          <h1 class="text-5xl font-bold font-handwriting">{{ form.title || '文章标题' }}</h1>
        </header>

        <!-- 关键：使用与文章详情页相同的类名来渲染预览内容 -->
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

// 引入 Marked 和 Prism，用于预览渲染
import { marked } from 'marked'
import Prism from '@/utils/prism.js'

const blogStore = useBlogStore()
const router = useRouter()

// ===== 表单数据 =====
const form = reactive({
  title: '',
  category: blogStore.categories[1] || '',
  image: '',
  content: ''
})
const isNewCategory = ref(false)
const newCategory = ref('')

// ===== 新增：预览相关状态 =====
const isPreviewing = ref(false)
const previewContainerRef = ref(null)

// ===== 确保 Marked 配置与文章详情页一致 =====
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

// ===== 新增：计算属性，用于生成预览的 HTML =====
const previewHtml = computed(() => {
  if (!form.content) {
    return '<p class="text-center text-gray-500 py-8">在编辑区域输入一些 Markdown 内容来查看预览...</p>'
  }

  // 1. 处理内部链接 [[...]]
  const titleToIdMap = new Map(blogStore.posts.map(p => [p.title, p.id]))
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const linkedContent = form.content.replace(linkRegex, (match, title) => {
    if (titleToIdMap.has(title)) {
      // 在预览中，链接可以暂时不跳转，或指向一个#
      return `<a href="#/article/${titleToIdMap.get(title)}" class="internal-link" target="_blank">${title}</a>`
    }
    return `<span class="internal-link-broken">${title}</span>`
  })

  // 2. 使用 marked 解析
  try {
    return marked.parse(linkedContent)
  } catch (e) {
    console.error('Markdown 解析失败:', e)
    return `<p>内容解析失败</p>`
  }
})

// ===== 新增：监听预览状态，切换时触发 Prism 高亮 =====
watch(isPreviewing, (isNowPreviewing) => {
  if (isNowPreviewing) {
    // 等待 DOM 更新后，再执行高亮
    nextTick(() => {
      if (previewContainerRef.value) {
        Prism.highlightAllUnder(previewContainerRef.value)
      }
    })
  }
})

const onCategoryChange = () => { isNewCategory.value = form.category === 'new-category' }

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
    tags: [] // 假设暂无标签或后续添加
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
/* 增加容器最大宽度，以便更好地容纳预览 */
.container {
  max-width: 900px;
}

/* Tab 切换按钮样式 */
.tab-button {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px; /* 覆盖父元素的 border-b */
  transition: all 0.2s ease-in-out;
  color: var(--text-color-light);
}

.tab-button:hover {
  color: var(--accent-color);
}

.tab-button.active-tab {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

/* 让表单输入框样式更好看一些 */
.admin-form .w-full {
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s;
}

.admin-form .w-full:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(244, 146, 109, 0.2);
}

/* 预览区域的样式 */
.preview-area {
  padding: 1rem 0;
}
</style>
