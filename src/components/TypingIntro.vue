<template>
  <transition name="fade-out">
    <div v-if="isVisible" class="typing-intro-screen">
      <!-- 动态背景粒子 -->
      <div class="particles-container">
        <div
            v-for="i in 50"
            :key="i"
            class="particle"
            :style="getParticleStyle(i)"
        ></div>
      </div>

      <!-- 渐变背景 -->
      <div class="gradient-background"></div>

      <!-- 浮动装饰元素 -->
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
        <div class="floating-square square-1"></div>
        <div class="floating-square square-2"></div>
      </div>

      <!-- 主要内容 -->
      <div class="content-wrapper">
        <!-- 标题区域 -->
        <div class="title-section">
          <div class="title-decoration"></div>
          <h1 class="font-handwriting main-title">
            <span
                v-for="(char, index) in fullText"
                :key="index"
                :class="['char', { 'visible': index < displayedText.length }]"
                :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ char }}
            </span>
            <span class="typing-cursor" :class="{ 'blink': showCursor }"></span>
          </h1>
          <div class="subtitle-wrapper">
            <div class="subtitle-line"></div>
            <p class="subtitle">keep going and enjoy your own life</p>
            <div class="subtitle-line"></div>
          </div>
        </div>

        <!-- 进度指示器 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
          </div>
          <div class="progress-text">{{ Math.round(progressWidth) }}%</div>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="bottom-decoration">
        <div class="wave-container">
          <svg class="wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
          </svg>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const emit = defineEmits(['animationFinished']);

const fullText = "要去看更大的世界~";
const displayedText = ref('');
const isVisible = ref(true);
const showCursor = ref(true);
const progressWidth = ref(0);

// 粒子样式生成
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2;
  const left = Math.random() * 100;
  const animationDuration = Math.random() * 20 + 10;
  const animationDelay = Math.random() * 5;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`,
  };
};

onMounted(() => {
  let i = 0;
  const totalDuration = 4000; // 总动画时长
  const charDelay = 200; // 每个字符的延迟

  // 进度条动画
  const progressInterval = setInterval(() => {
    if (progressWidth.value < 100) {
      progressWidth.value += 2;
    } else {
      clearInterval(progressInterval);
    }
  }, totalDuration / 50);

  // 打字机效果
  const typeWriter = () => {
    if (i < fullText.length) {
      displayedText.value += fullText.charAt(i);
      i++;
      setTimeout(typeWriter, charDelay);
    } else {
      // 打字完成后的处理
      setTimeout(() => {
        showCursor.value = false;
        setTimeout(() => {
          isVisible.value = false;
          setTimeout(() => {
            emit('animationFinished');
          }, 1000);
        }, 1000);
      }, 1500);
    }
  };

  // 延迟开始动画
  setTimeout(typeWriter, 800);
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
  background: var(--color-bg);
  z-index: 1000;
  overflow: hidden;
}

/* 渐变背景 */
.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      ellipse at center,
      rgba(244, 146, 109, 0.1) 0%,
      rgba(244, 146, 109, 0.05) 50%,
      transparent 100%
  );
  animation: gradientShift 8s ease-in-out infinite alternate;
}

@keyframes gradientShift {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.6;
  }
}

/* 粒子系统 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: var(--color-particle);
  border-radius: 50%;
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* 浮动装饰元素 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--color-accent), rgba(244, 146, 109, 0.3));
  animation: floatUpDown 6s ease-in-out infinite;
}

.floating-square {
  position: absolute;
  background: linear-gradient(45deg, var(--color-table-head), rgba(91, 138, 174, 0.3));
  transform: rotate(45deg);
  animation: floatUpDown 8s ease-in-out infinite reverse;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 40px;
  height: 40px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

.square-1 {
  width: 50px;
  height: 50px;
  top: 30%;
  right: 20%;
  animation-delay: 1s;
}

.square-2 {
  width: 30px;
  height: 30px;
  top: 70%;
  right: 30%;
  animation-delay: 3s;
}

@keyframes floatUpDown {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 主要内容 */
.content-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 90%;
}

.title-section {
  margin-bottom: 3rem;
}

.title-decoration {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--color-accent), var(--color-table-head));
  margin: 0 auto 2rem;
  border-radius: 2px;
  animation: expandWidth 2s ease-out 0.5s both;
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

.main-title {
  font-size: 2.5rem;
  color: var(--color-fg);
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 20px rgba(0,0,0,0.1);
}

.char {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.char.visible {
  opacity: 1;
  transform: translateY(0);
}

.typing-cursor {
  display: inline-block;
  width: 3px;
  height: 1.2em;
  background-color: var(--color-accent);
  margin-left: 2px;
  animation: cursorBlink 1s infinite;
}

.typing-cursor.blink {
  animation: cursorBlink 1s infinite;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.subtitle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  opacity: 0;
  animation: fadeInUp 1s ease-out 2s both;
}

.subtitle-line {
  width: 40px;
  height: 1px;
  background: var(--color-border);
  margin: 0 1rem;
}

.subtitle {
  color: var(--color-fg-subtle);
  font-size: 1rem;
  margin: 0;
  white-space: nowrap;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 进度指示器 */
.progress-container {
  margin-top: 3rem;
  opacity: 0;
  animation: fadeInUp 1s ease-out 1s both;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: 0 auto 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-table-head));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--color-fg-subtle);
  font-size: 0.9rem;
  font-family: 'LXGW WenKai TC', 'LXGW WenKai', sans-serif;
}

/* 底部装饰波浪 */
.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  pointer-events: none;
}

.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.wave {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 150px;
}

.shape-fill {
  fill: var(--color-accent);
  opacity: 0.1;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .main-title {
    font-size: 3.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .progress-bar {
    width: 300px;
  }
}

@media (min-width: 1024px) {
  .main-title {
    font-size: 4rem;
  }
}

/* 淡出动画 */
.fade-out-leave-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fade-out-leave-to {
  opacity: 0;
  transform: scale(1.1);
  filter: blur(10px);
}

/* 暗色主题适配 */
.dark .gradient-background {
  background: radial-gradient(
      ellipse at center,
      rgba(246, 173, 85, 0.1) 0%,
      rgba(246, 173, 85, 0.05) 50%,
      transparent 100%
  );
}

.dark .floating-circle {
  background: linear-gradient(45deg, var(--color-accent), rgba(246, 173, 85, 0.3));
}

.dark .shape-fill {
  fill: var(--color-accent);
  opacity: 0.05;
}
</style>