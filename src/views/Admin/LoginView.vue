<template>
  <div class="page min-h-screen flex items-center justify-center">
    <div class="bg-[var(--card-bg)] rounded-lg p-8 max-w-md w-full mx-4 border border-[var(--border-color)] shadow-lg">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-handwriting mb-2">管理员登录</h1>
        <p class="text-[var(--text-color-light)] text-sm">请输入管理员账号密码</p>
      </div>

      <form @submit.prevent="handleLogin" class="admin-form space-y-6">
        <div>
          <label class="block text-sm font-bold mb-2">用户名</label>
          <input
              v-model="form.username"
              type="text"
              class="w-full"
              placeholder="请输入用户名"
              required
              :disabled="loading"
          >
        </div>

        <div>
          <label class="block text-sm font-bold mb-2">密码</label>
          <input
              v-model="form.password"
              type="password"
              class="w-full"
              placeholder="请输入密码"
              required
              :disabled="loading"
          >
        </div>

        <div v-if="error" class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
          {{ error }}
        </div>

        <button
            type="submit"
            class="w-full bg-[var(--accent-color)] hover:opacity-90 text-white font-bold py-3 px-6 rounded transition-all disabled:opacity-50"
            :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <router-link
            to="/"
            class="text-[var(--text-color-light)] hover:text-[var(--accent-color)] text-sm transition-colors"
        >
          ← 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/authAPI'

const router = useRouter()
const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await login(form.username, form.password)

    if (response.code === 1000) {
      // 登录成功，将密钥存储到 localStorage
      const token = response.data
      localStorage.setItem('admin_token', token)
      // 跳转到管理面板
      router.push('/admin')
    } else {
      error.value = response.msg || '登录失败，请检查用户名和密码'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error('登录错误:', err)
  } finally {
    loading.value = false
  }
}
</script>