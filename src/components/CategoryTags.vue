<template>
  <div class="relative">
    <!-- 移动端：水平滚动 -->
    <div class="md:hidden relative">
      <div class="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[var(--color-bg-muted)] [&::-webkit-scrollbar-thumb]:bg-[var(--color-accent)] [&::-webkit-scrollbar-thumb]:rounded">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          @click="$emit('update:modelValue', cat)" 
          class="flex-shrink-0 snap-start font-semibold relative cursor-pointer rounded-sm border bg-[var(--color-surface)] px-4 py-2 shadow-[1px_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_8px_rgba(0,0,0,0.10)] text-[var(--color-fg)] whitespace-nowrap text-sm" 
          :class="{ 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]': modelValue === cat }"
          :style=" modelValue !== cat && cat !== '全部' && props.colorMap && props.colorMap[cat] ? { borderColor: props.colorMap[cat] } : {}"
        >
          {{ cat }}
        </button>
      </div>
      <div class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[var(--color-bg)] to-transparent"></div>
      <div v-if="showScrollHint" class="text-center mt-2 text-xs opacity-60">👆 左右滑动查看更多标签</div>
    </div>
    <!-- 桌面端：智能布局 -->
    <div class="hidden md:block">
      <div 
        class="flex flex-wrap gap-4 transition-[max-height] duration-300 ease-in-out" 
        :class=" [
          centerAlign ? 'justify-center' : 'justify-start',
          { 'max-h-20 overflow-hidden': !showAllTags && categories.length > maxVisibleTags }
        ]"
      >
        <button 
          v-for="cat in categories" 
          :key="cat" 
          @click="$emit('update:modelValue', cat)" 
          class="font-semibold relative cursor-pointer rounded-sm border bg-[var(--color-surface)] px-4 py-2 shadow-[1px_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[2px_2px_8px_rgba(0,0,0,0.10)] text-[var(--color-fg)] text-sm" 
          :class="{ 'bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]': modelValue === cat }"
          :style=" modelValue !== cat && cat !== '全部' && props.colorMap && props.colorMap[cat] ? { borderColor: props.colorMap[cat] } : {}"
        >
          {{ cat }}
        </button>
      </div>
      <div v-if="categories.length > maxVisibleTags" :class="[centerAlign ? 'text-center' : 'text-left', 'mt-4']">
        <button 
          @click="showAllTags = !showAllTags"
          class="text-sm px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-0.5 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[color:var(--color-fg-subtle)] hover:shadow-sm"
        >
          {{ showAllTags ? '收起标签 ↑' : '显示更多标签 ↓' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    required: true
  },
  centerAlign: {
    type: Boolean,
    default: true
  },
  showScrollHint: {
    type: Boolean,
    default: true
  },
  maxVisibleTags: {
    type: Number,
    default: 8
  }
})

defineEmits(['update:modelValue'])

const showAllTags = ref(false)
</script>

<style scoped>
/* 仍保持空，仅注释 */
</style>
