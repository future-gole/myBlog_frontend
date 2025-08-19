import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {createPost, getPosts} from '@/services/postsAPI'
import {getCategories, getGraphData} from '@/services/generalAPI'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([])
  const graph = ref({ nodes: [], links: [] })
  const theme = ref('light')
  // categoriesRaw: 后端返回 [{ categoryId, categoryName, categoryColor }]
  const categoriesRaw = ref([])
  // UI 分类（含“全部”）
  const categoriesUI = computed(() => [
    { id: 'all', name: '全部', color: '' },
    ...categoriesRaw.value.map(c => ({ id: String(c.categoryId), name: c.categoryName, color: c.categoryColor }))
  ])
  // id -> name
  const categoryIdToName = computed(() => {
    const map = {}
    categoriesRaw.value.forEach(c => { map[String(c.categoryId)] = c.categoryName })
    return map
  })
  // name -> color
  const categoryColorMap = computed(() => {
    const map = {}
    categoriesRaw.value.forEach(c => { map[c.categoryName] = c.categoryColor })
    return map
  })

  const graphData = computed(() => graph.value)

  async function loadInitialData() {
    try {
  const [postsData, graphDataFromServer, categoriesData] = await Promise.all([
        getPosts(),
        getGraphData(),
        getCategories()
      ]);
  posts.value = postsData;
  graph.value = graphDataFromServer;
  // categoriesData 期望: [{categoryId, categoryName, categoryColor}]
  categoriesRaw.value = categoriesData;
    } catch (error) {
      console.error("加载初始数据失败 (将使用本地 Mock 数据):", error);
      // Fallback to mock data if API fails
      const mockPosts = [ { id: "baking-scones", title: "午后红茶：烤一盘暖暖的司康", date: "2025-07-25", category: "手作与生活", image: "https://placehold.co/400x300/e6a3a3/fdfaf6?text=Scones", content: "这是【烤司康】的示例内容。\n\n在我的[[慢生活练习：从泡一杯好茶开始]]一文中，我提到了下午茶的重要性。" }, { id: "slow-living", title: "慢生活练习：从泡一杯好茶开始", date: "2025-07-09", category: "情绪花园", image: "https://placehold.co/400x300/dcd1c6/fdfaf6?text=Tea", content: "这是【慢生活】的示例内容。\n\n慢生活与[[午后红茶：烤一盘暖暖的司康]]是绝配。" } ];
      posts.value = mockPosts;
      categoriesRaw.value = [
        { categoryId: 1, categoryName: '手作与生活', categoryColor: '#e6a3a3' },
        { categoryId: 2, categoryName: '情绪花园', categoryColor: '#aed9b4' }
      ];
      graph.value = { nodes: mockPosts, links: [{source: 'baking-scones', target: 'slow-living'}] };
    }
  }

  async function addPost(newPostData) {
    try {
      const createdPost = await createPost(newPostData);
      await loadInitialData(); 
      return createdPost;
    } catch (error) {
      console.error("发布文章失败:", error);
      throw error;
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    document.documentElement.className = theme.value;
    localStorage.setItem('theme', theme.value);
  }

  function loadTheme() {
    theme.value = localStorage.getItem('theme') || 'light';
    document.documentElement.className = theme.value;
  }

  return { posts, theme, graphData, categoriesUI, categoryColorMap, categoryIdToName, loadInitialData, addPost, toggleTheme, loadTheme }
})
