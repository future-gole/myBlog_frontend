<template>
  <div class="page">
    <TheHeader />
    <main class="container mx-auto max-w-3xl px-6 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-handwriting">发布新文章</h1>
      </div>
      <form @submit.prevent="submitPost" class="admin-form space-y-6">
        <div><label class="block text-sm font-bold mb-2">标题</label><input v-model="form.title" type="text" class="w-full" required></div>
        <div><label class="block text-sm font-bold mb-2">分类</label>
          <select v-model="form.category" @change="onCategoryChange" class="w-full">
            <option v-for="cat in blogStore.categories.filter(c => c !== '全部')" :key="cat" :value="cat">{{ cat }}</option>
            <option value="new-category">（新建分类）</option>
          </select>
          <input v-if="isNewCategory" v-model="newCategory" type="text" class="w-full mt-2" placeholder="输入新分类名">
        </div>
        <div><label class="block text-sm font-bold mb-2">图片URL</label><input v-model="form.image" type="text" class="w-full" placeholder="https://placehold.co/..."></div>
        <div><label class="block text-sm font-bold mb-2">内容 (使用 [[标题]] 来链接文章)</label><textarea v-model="form.content" rows="10" class="w-full" required></textarea></div>
        <div><button type="submit" class="bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-2 px-6 rounded">发布</button></div>
      </form>
    </main>
  </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/blogStore'
import TheHeader from '@/components/TheHeader.vue'

const blogStore = useBlogStore()
const router = useRouter()
const form = reactive({ title: '', category: blogStore.categories[1] || '', image: '', content: '' })
const isNewCategory = ref(false)
const newCategory = ref('')

const onCategoryChange = () => { isNewCategory.value = form.category === 'new-category' }

const submitPost = async () => {
  let finalCategory = form.category;
  if (isNewCategory.value) {
    if (!newCategory.value.trim()) { alert('新分类名不能为空！'); return; }
    finalCategory = newCategory.value.trim();
  }
  const newPost = {
    id: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
    title: form.title,
    date: new Date().toISOString().slice(0, 10),
    category: finalCategory,
    image: form.image || `https://placehold.co/400x300/cccccc/fdfaf6?text=${encodeURIComponent(form.title)}`,
    content: form.content,
  };
  try {
    const createdPost = await blogStore.addPost(newPost);
    alert('发布成功！');
    router.push(`/article/${createdPost.id}`);
  } catch (error) {
    alert('发布失败，请查看控制台');
  }
}
</script>
