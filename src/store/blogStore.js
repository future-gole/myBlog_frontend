import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {createPost, getPosts} from '@/services/postsAPI'
import {getCategories, getGraphData} from '@/services/generalAPI'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([])
  const graph = ref({ nodes: [], links: [] })
  const theme = ref('light')
  const categories = ref(['全部'])

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
      categories.value = ['全部', ...categoriesData];
    } catch (error) {
      console.error("加载初始数据失败 (将使用本地 Mock 数据):", error);
      // Fallback to mock data if API fails
      const mockPosts = [ { id: "baking-scones", title: "午后红茶：烤一盘暖暖的司康", date: "2025-07-25", category: "手作与生活", image: "https://placehold.co/400x300/e6a3a3/fdfaf6?text=Scones", content: "这是【烤司康】的示例内容。\n\n在我的[[慢生活练习：从泡一杯好茶开始]]一文中，我提到了下午茶的重要性。" }, { id: "slow-living", title: "慢生活练习：从泡一杯好茶开始", date: "2025-07-09", category: "情绪花园", image: "https://placehold.co/400x300/dcd1c6/fdfaf6?text=Tea", content: "这是【慢生活】的示例内容。\n\n慢生活与[[午后红茶：烤一盘暖暖的司康]]是绝配。" } ];
      posts.value = mockPosts;
      categories.value = ['全部', '手作与生活', '情绪花园'];
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

  return { posts, theme, graphData, categories, loadInitialData, addPost, toggleTheme, loadTheme }
})
