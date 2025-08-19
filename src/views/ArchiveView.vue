<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-5xl px-6 py-12">
      <div class="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h1 class="text-5xl font-bold font-handwriting">所有文章</h1>
        <div class="flex items-center gap-4">
          <!-- Rewritten view switcher -->
          <div class="relative flex rounded-full p-1 bg-[var(--color-border)] overflow-hidden text-sm font-semibold">
            <span class="absolute inset-y-1 left-1 w-1/2 rounded-full bg-[var(--color-surface)] shadow-sm transition-transform duration-300 will-change-transform"
              :style="{ transform: currentView === 'gallery' ? 'translateX(100%)' : 'translateX(0%)' }"></span>
            <button @click="setView('list')"
              class="relative z-10 px-4 py-1 transition-colors"
              :class="currentView === 'list' ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-subtle)]'">列表</button>
            <button @click="setView('gallery')"
              class="relative z-10 px-4 py-1 transition-colors"
              :class="currentView === 'gallery' ? 'text-[var(--color-fg)]' : 'text-[var(--color-fg-subtle)]'">画廊</button>
          </div>
        </div>
      </div>
      <!-- 标签筛选区域 -->
      <CategoryTags 
        v-model="currentCategory"
        :categories="blogStore.categoriesUI.map(c=>c.name)"
        :center-align="true"
        :show-scroll-hint="true"
        class="mb-12"
      />
      <div id="posts-container">
        <div v-if="currentView === 'list'">
          <a v-for="post in paginatedPosts" :key="post.id" :href="`#/article/${post.id}`" class="block py-6 border-b group" style="border-color:var(--color-border)">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-2xl font-handwriting font-bold group-hover:text-[var(--color-fg-muted)] transition-colors">{{ post.title }}</h3>
                <p class="mt-1 text-[color:var(--color-fg-subtle)]">{{ post.date }} · {{ post.category }}</p>
              </div>
              <span class="group-hover:translate-x-2 transition-transform text-[color:var(--color-fg-subtle)]">→</span>
            </div>
          </a>
        </div>
        <div v-if="currentView === 'gallery'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ArticleCard v-for="post in paginatedPosts" :key="post.id" :post="post" />
        </div>
        <p v-if="!filteredPosts.length" class="text-center py-10 text-[color:var(--color-fg-subtle)]">这个分类下还没有文章哦。</p>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-10 flex flex-nowrap items-center justify-center gap-2 sm:gap-4 select-none overflow-x-auto whitespace-nowrap no-scrollbar px-2" aria-label="分页导航">
          <!-- Prev -->
          <button
            class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface)] shrink-0"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >上一页</button>

          <!-- Next -->
          <button
            class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface)] shrink-0"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >下一页</button>

          <!-- Jump -->
          <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0">
            <span class="text-[color:var(--color-fg-subtle)] hidden sm:inline">跳转到</span>
            <span class="text-[color:var(--color-fg-subtle)] sm:hidden">跳转</span>
            <input
              v-model.number="jumpToPage"
              @keyup.enter="handleJumpTo"
              type="number"
              :min="1"
              :max="totalPages"
              class="w-12 sm:w-16 h-8 sm:h-9 px-1.5 sm:px-2 py-1 pr-2 text-center border rounded bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-blue-500 no-spinner"
            />
            <span class="text-[color:var(--color-fg-subtle)] hidden sm:inline">/ {{ totalPages }} 页</span>
            <span class="text-[color:var(--color-fg-subtle)] sm:hidden">/{{ totalPages }}</span>
            <button
              class="px-2.5 sm:px-3 h-8 sm:h-9 rounded-md border text-xs sm:text-sm hover:bg-[var(--color-surface)] transition-colors"
              @click="handleJumpTo"
            >Go</button>
          </div>

          <span class="text-[10px] sm:text-xs text-[color:var(--color-fg-subtle)] hidden sm:inline shrink-0">共 {{ filteredPosts.length }} 篇</span>
        </nav>
      </div>
    </main>
  </div>
</template>
<style scoped>
/* 隐藏 number input 默认上下箭头 (Chrome, Edge, Safari) */
input[type=number].no-spinner::-webkit-inner-spin-button,
input[type=number].no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
/* Firefox */
input[type=number].no-spinner { -moz-appearance: textfield; appearance: textfield; }
/* 隐藏横向滚动条 (移动端) */
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import CategoryTags from '@/components/CategoryTags.vue'

const blogStore = useBlogStore()
const currentView = ref('list')
const currentCategory = ref('全部')

const filteredPosts = computed(() => {
  if (currentCategory.value === '全部') return blogStore.posts
  return blogStore.posts.filter(p => p.category === currentCategory.value)
})

const setView = (view) => { 
  currentView.value = view 
}

// Responsive pagination
const width = ref(window.innerWidth)
function handleResize() { width.value = window.innerWidth }
onMounted(() => { window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize) })

const pageSize = computed(() => width.value < 768 ? 5 : 10) // 手机:5, 电脑:10
const currentPage = ref(1)
const jumpToPage = ref(1)

// Reset page when filters or pageSize change
watch([currentCategory, pageSize], () => { 
  currentPage.value = 1
  jumpToPage.value = 1
})

// Sync jumpToPage with currentPage
watch(currentPage, (newPage) => {
  jumpToPage.value = newPage
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize.value)))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPosts.value.slice(start, start + pageSize.value)
})

function changePage(p) {
  if (typeof p !== 'number') return
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  // 滚动到列表顶部
  const container = document.getElementById('posts-container')
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleJumpTo() {
  const page = parseInt(jumpToPage.value)
  if (isNaN(page) || page < 1 || page > totalPages.value) {
    jumpToPage.value = currentPage.value // 重置为当前页
    return
  }
  changePage(page)
}
</script>