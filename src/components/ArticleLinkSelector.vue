<template>
  <div v-if="isVisible" class="link-selector" :style="selectorStyle">
    <div class="selector-header">
      <span class="selector-title">选择要链接的文章</span>
      <span class="selector-hint">↑↓ 选择 • Enter 确认 • Esc 取消</span>
    </div>
    <div class="selector-list" ref="selectorListRef">
      <div
          v-for="(post, index) in filteredPosts"
          :key="`${post.category}-${post.title}-${post.id}`"
          :ref="el => setItemRef(el, index)"
          :class="['selector-item', { 'selected': index === selectedIndex }]"
          @click="selectPost(post)"
          @mouseenter="selectedIndex = index"
      >
        <div class="post-title">{{ post.title }}</div>
        <div class="post-meta">{{ post.category }} • {{ post.date }}</div>
      </div>
      <div v-if="filteredPosts.length === 0" class="no-results">
        没有找到匹配的文章
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  searchText: String,
  posts: Array,
  position: Object // { top, left }
})

const emit = defineEmits(['select', 'cancel'])

const selectedIndex = ref(0)
const selectorListRef = ref(null)
const itemRefs = ref([])

// 设置item引用
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// 过滤文章列表
const filteredPosts = computed(() => {
  if (!props.searchText) return props.posts

  return props.posts.filter(post =>
      post.title.toLowerCase().includes(props.searchText.toLowerCase())
  )
})

// 计算选择器位置
const selectorStyle = computed(() => ({
  position: 'absolute',
  top: `${props.position?.top || 0}px`,
  left: `${props.position?.left || 0}px`,
  zIndex: 1000
}))

// 滚动到选中项
const scrollToSelected = () => {
  nextTick(() => {
    const selectedItem = itemRefs.value[selectedIndex.value]
    const listContainer = selectorListRef.value

    if (selectedItem && listContainer) {
      const itemTop = selectedItem.offsetTop
      const itemHeight = selectedItem.offsetHeight
      const containerTop = listContainer.scrollTop
      const containerHeight = listContainer.clientHeight

      // 如果选中项在可视区域上方
      if (itemTop < containerTop) {
        listContainer.scrollTop = itemTop
      }
      // 如果选中项在可视区域下方
      else if (itemTop + itemHeight > containerTop + containerHeight) {
        listContainer.scrollTop = itemTop + itemHeight - containerHeight
      }
    }
  })
}

// 监听搜索文本变化，重置选中索引
watch(() => props.searchText, () => {
  selectedIndex.value = 0
  scrollToSelected()
})

// 监听可见性变化
watch(() => props.isVisible, (visible) => {
  if (visible) {
    selectedIndex.value = 0
    itemRefs.value = []
    nextTick(() => {
      scrollToSelected()
    })
  }
})

// 监听选中索引变化，自动滚动
watch(selectedIndex, () => {
  scrollToSelected()
})

// 键盘事件处理
const handleKeydown = (event) => {
  if (!props.isVisible) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredPosts.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (filteredPosts.value[selectedIndex.value]) {
        selectPost(filteredPosts.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('cancel')
      break
  }
}

const selectPost = (post) => {
  emit('select', post)
}

// 暴露键盘事件处理函数给父组件
defineExpose({ handleKeydown })
</script>

<style scoped>
.link-selector {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  max-height: 300px;
  overflow: hidden;
}

.selector-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color-secondary);
}

.selector-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}

.selector-hint {
  font-size: 0.75rem;
  color: var(--text-color-light);
  float: right;
}

.selector-list {
  max-height: 240px;
  overflow-y: auto;
  /* 添加平滑滚动 */
  scroll-behavior: smooth;
}

.selector-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color-light);
  transition: background-color 0.2s;
}

.selector-item:hover,
.selector-item.selected {
  background: var(--accent-color-light);
}

.selector-item:last-child {
  border-bottom: none;
}

.post-title {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 2px;
}

.post-meta {
  font-size: 0.8rem;
  color: var(--text-color-light);
}

.no-results {
  padding: 16px 12px;
  text-align: center;
  color: var(--text-color-light);
  font-style: italic;
}
</style>