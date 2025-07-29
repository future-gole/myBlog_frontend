<template>
  <transition name="fade-out">
    <div v-if="isVisible" class="typing-intro-screen">
      <div class="background-image"></div>
      <div class="overlay"></div>
      <h1 class="font-handwriting">
        {{ displayedText }}<span class="typing-cursor"></span>
      </h1>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['animationFinished']);

const fullText = "要去看更大的世界~";
const displayedText = ref('');
const isVisible = ref(true);

onMounted(() => {
  let i = 0;
  const typeWriter = () => {
    if (i < fullText.length) {
      displayedText.value += fullText.charAt(i);
      i++;
      setTimeout(typeWriter, 200); // 每个字的输入速度
    } else {
      // 打字完成，等待1.5秒后开始淡出
      setTimeout(() => {
        isVisible.value = false;
        // 在淡出动画的同时，通知父组件动画已结束
        setTimeout(() => {
            emit('animationFinished');
        }, 800); // 等待淡出动画完成
      }, 1500); 
    }
  };
  // 延迟半秒开始打字
  setTimeout(typeWriter, 500);
});
</script>

<style scoped>
.typing-intro-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  z-index: 1000;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('src\\assets\\image\\void芙莉莲4k_1340d.jpg');
  background-size: cover;
  background-position: center;
  animation: ken-burns 25s ease-in-out infinite alternate;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-color);
  opacity: 0.6;
}

@keyframes ken-burns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.1) translate(-2%, 2%);
  }
}

h1 {
  position: relative;
  z-index: 2;
  font-size: 2.5rem; /* 40px */
  color: var(--text-color);
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  h1 {
    font-size: 3.75rem; /* 60px */
  }
}

.fade-out-leave-active {
  transition: opacity 0.8s ease-out;
}
.fade-out-leave-to {
  opacity: 0;
}
</style>