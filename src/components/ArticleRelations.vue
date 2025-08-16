<template>
  <div class="article-relations">
    <!-- 导航栏切换 -->
    <div class="relations-nav">
      <button
          :class="['nav-tab', { active: activeTab === 'incoming' }]"
          @click="activeTab = 'incoming'"
      >
        <div class="tab-icon incoming">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </div>
        <span class="tab-text">引用此文</span>
        <span v-if="incomingLinks.length > 0" class="tab-badge">{{ incomingLinks.length }}</span>
      </button>

      <button
          :class="['nav-tab', { active: activeTab === 'outgoing' }]"
          @click="activeTab = 'outgoing'"
      >
        <div class="tab-icon outgoing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <span class="tab-text">文中引用</span>
        <span v-if="outgoingLinks.length > 0" class="tab-badge">{{ outgoingLinks.length }}</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="relations-content">
      <!-- 入链内容 -->
      <div v-if="activeTab === 'incoming'" class="tab-content">
        <div v-if="incomingLinks.length > 0" class="links-grid">
          <article
              v-for="link in incomingLinks"
              :key="`incoming-${link.id}`"
              class="link-card incoming-card"
              @click="navigateToArticle(link.id)"
          >
            <div class="card-header">
              <div class="card-category">{{ link.category }}</div>
              <div class="card-date">{{ formatDate(link.createdAt || link.date) }}</div>
            </div>
            <h3 class="card-title">{{ link.title }}</h3>
            <div class="card-footer">
              <div class="link-direction">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>引用了这篇文章</span>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </div>
          <p class="empty-text">暂无文章引用</p>
          <p class="empty-hint">还没有其他文章链接到这里</p>
        </div>
      </div>

      <!-- 出链内容 -->
      <div v-if="activeTab === 'outgoing'" class="tab-content">
        <div v-if="outgoingLinks.length > 0" class="links-grid">
          <article
              v-for="link in outgoingLinks"
              :key="`outgoing-${link.id}`"
              class="link-card outgoing-card"
              @click="navigateToArticle(link.id)"
          >
            <div class="card-header">
              <div class="card-category">{{ link.category }}</div>
              <div class="card-date">{{ formatDate(link.createdAt || link.date) }}</div>
            </div>
            <h3 class="card-title">{{ link.title }}</h3>
            <div class="card-footer">
              <div class="link-direction">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span>在文中被引用</span>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <p class="empty-text">暂无引用文章</p>
          <p class="empty-hint">这篇文章还没有引用其他文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/blogStore'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const blogStore = useBlogStore()
const activeTab = ref('incoming')

// 获取当前文章的 ID（确保是字符串格式）
const currentPostId = computed(() => String(props.postId))

// 使用 store 中的图数据来计算入链和出链
const graphData = computed(() => blogStore.graphData)

// 计算入链（哪些文章指向当前文章）
const incomingLinks = computed(() => {
  if (!graphData.value || !graphData.value.links) return []

  // 找到所有指向当前文章的链接
  const incomingLinkIds = graphData.value.links
      .filter(link => String(link.target) === currentPostId.value)
      .map(link => String(link.source))

  // 根据 ID 找到对应的文章，并去重（处理重复文章问题）
  const uniqueLinks = new Map()
  blogStore.posts.forEach(post => {
    if (incomingLinkIds.includes(String(post.id))) {
      const key = `${post.category}-${post.title}`
      if (!uniqueLinks.has(key)) {
        uniqueLinks.set(key, post)
      }
    }
  })

  return Array.from(uniqueLinks.values())
})

// 计算出链（当前文章指向哪些文章）
const outgoingLinks = computed(() => {
  if (!graphData.value || !graphData.value.links) return []

  // 找到所有从当前文章出发的链接
  const outgoingLinkIds = graphData.value.links
      .filter(link => String(link.source) === currentPostId.value)
      .map(link => String(link.target))
console.log(outgoingLinkIds)
  // 根据 ID 找到对应的文章，并去重（处理重复文章问题）
  const uniqueLinks = new Map()
  blogStore.posts.forEach(post => {
    if (outgoingLinkIds.includes(String(post.id))) {
      const key = `${post.category}-${post.title}`
      console.log(`${post.category}-${post.title}`)
      if (!uniqueLinks.has(key)) {
        uniqueLinks.set(key, post)
      }
    }
  })

  return Array.from(uniqueLinks.values())
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return '未知'
  }
}

// 导航到文章
const navigateToArticle = (articleId) => {
  router.push(`/article/${articleId}`)
}
</script>

<style scoped>
.article-relations {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 1.5rem;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.relations-nav {
  display: flex;
  background: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  background: transparent;
  color: var(--text-color-light);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
}

.nav-tab:hover {
  color: var(--text-color);
  background: rgba(244, 146, 109, 0.05);
}

.nav-tab.active {
  color: var(--accent-color);
  background: var(--card-bg);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), #ff8a65);
  border-radius: 3px 3px 0 0;
}

.tab-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tab-icon.incoming {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.tab-icon.outgoing {
  background: linear-gradient(135deg, var(--accent-color), #ff8a65);
  color: white;
}

.tab-icon svg {
  width: 12px;
  height: 12px;
}

.tab-text {
  font-size: 0.9rem;
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
}

.tab-badge {
  background: var(--accent-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(244, 146, 109, 0.3);
}

/* 内容区域 */
.relations-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.tab-content {
  height: 100%;
}

.links-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

/* 文章卡片样式 */
.link-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.link-card:hover::before {
  transform: translateX(100%);
}

.link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color);
}

.incoming-card:hover {
  border-color: #10b981;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
}

.incoming-card::before {
  background: linear-gradient(90deg, transparent, #10b981, transparent);
}

.outgoing-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 8px 25px rgba(244, 146, 109, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-category {
  background: linear-gradient(135deg, var(--accent-color), #ff8a65);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(244, 146, 109, 0.3);
}

.incoming-card .card-category {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.card-date {
  font-size: 0.75rem;
  color: var(--text-color-lighter);
  font-family: 'Noto Serif SC', serif;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 1rem 0;
  line-height: 1.4;
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-direction {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-light);
  font-size: 0.8rem;
}

.link-direction svg {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  height: 100%;
  min-height: 200px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  color: var(--text-color-lighter);
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color-light);
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
}

.empty-hint {
  font-size: 0.9rem;
  color: var(--text-color-lighter);
  font-style: italic;
}

/* 暗色主题适配 */
.dark .article-relations {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.dark .link-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.dark .incoming-card:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
}

.dark .outgoing-card:hover {
  box-shadow: 0 8px 25px rgba(244, 146, 109, 0.25);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-relations {
    margin-top: 0;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .relations-nav {
    background: var(--card-bg);
    padding: 1rem;
    gap: 0.75rem;
  }

  .nav-tab {
    flex: 1;
    padding: 1.25rem 1rem;
    border-radius: 1rem;
    border: 1px solid var(--border-color);
    background: var(--bg-color-secondary);
    transition: all 0.3s ease;
    position: relative;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    min-height: 5rem;
  }

  .nav-tab::after {
    display: none;
  }

  .nav-tab.active {
    background: linear-gradient(135deg, var(--accent-color), #ff8a65);
    color: white;
    border-color: var(--accent-color);
    box-shadow: 0 6px 20px rgba(244, 146, 109, 0.3);
    transform: translateY(-3px);
  }

  .nav-tab.active .tab-icon {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.1);
  }

  .nav-tab.active .tab-badge {
    background: white;
    color: var(--accent-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .nav-tab:not(.active):hover {
    background: rgba(244, 146, 109, 0.1);
    border-color: rgba(244, 146, 109, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tab-icon {
    width: 28px;
    height: 28px;
  }

  .tab-icon svg {
    width: 16px;
    height: 16px;
  }

  .tab-text {
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
  }

  .tab-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 0.75rem;
  }

  .relations-content {
    padding: 1.25rem;
    max-height: 65vh;
  }

  .link-card {
    padding: 1.25rem;
    border-radius: 0.75rem;
  }

  .card-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .card-header {
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .card-category {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
    border-radius: 0.5rem;
  }

  .card-date {
    font-size: 0.75rem;
  }

  .links-grid {
    gap: 1rem;
  }

  .link-direction {
    font-size: 0.8rem;
  }

  .empty-state {
    padding: 2.5rem 1.5rem;
    min-height: 180px;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 1.25rem;
  }

  .empty-text {
    font-size: 1.1rem;
  }

  .empty-hint {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .relations-nav {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .nav-tab {
    padding: 1rem 0.75rem;
    min-height: 4.5rem;
  }

  .tab-icon {
    width: 24px;
    height: 24px;
  }

  .tab-icon svg {
    width: 14px;
    height: 14px;
  }

  .tab-text {
    font-size: 0.8rem;
  }

  .tab-badge {
    top: 0.5rem;
    right: 0.5rem;
    min-width: 1.25rem;
    height: 1.25rem;
    font-size: 0.65rem;
  }

  .relations-content {
    padding: 1rem;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .card-category {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }
}
</style>