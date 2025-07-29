<template>
  <div>
    <div id="starry-sky" class="dynamic-background"></div>
    <div id="daylight-effect" class="dynamic-background"></div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
onMounted(() => {
    const createStarrySky = () => { const sky = document.getElementById('starry-sky'); if (!sky || sky.children.length > 0) return; const numStars = 200; for (let i = 0; i < numStars; i++) { const star = document.createElement('div'); star.className = 'star'; const size = Math.random() * 2 + 1; star.style.width = `${size}px`; star.style.height = `${size}px`; star.style.top = `${Math.random() * 100}%`; star.style.left = `${Math.random() * 100}%`; star.style.animationDelay = `${Math.random() * 5}s`; star.style.animationDuration = `${Math.random() * 3 + 4}s`; sky.appendChild(star); } const numShootingStars = 3; for (let i = 0; i < numShootingStars; i++) { const shootingStar = document.createElement('div'); shootingStar.className = 'shooting-star'; shootingStar.style.top = `${Math.random() * 50}%`; shootingStar.style.right = `-${Math.random() * 300}px`; shootingStar.style.animationDelay = `${Math.random() * 10 + 5}s`; shootingStar.style.width = `${Math.random() * 100 + 100}px`; sky.appendChild(shootingStar); } };
    const createDaylightEffect = () => { const container = document.getElementById('daylight-effect'); if (!container || container.children.length > 0) return; const numParticles = 100; for (let i = 0; i < numParticles; i++) { const particle = document.createElement('div'); particle.className = 'particle'; const size = Math.random() * 3.5 + 1; particle.style.width = `${size}px`; particle.style.height = `${size}px`; particle.style.left = `${Math.random() * 100}%`; particle.style.bottom = `-${Math.random() * 100}%`; particle.style.animationDelay = `${Math.random() * 20}s`; particle.style.animationDuration = `${Math.random() * 15 + 10}s`; container.appendChild(particle); } };
    createStarrySky();
    createDaylightEffect();
})
</script>
<style>
.dynamic-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2; opacity: 0; transition: opacity 0.8s; background: var(--bg-color); overflow: hidden; }
.dark #starry-sky { opacity: 1; }
.light #daylight-effect { opacity: 1; }
.star { position: absolute; background-color: #fff; border-radius: 50%; animation: twinkle 5s infinite ease-in-out; }
@keyframes twinkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.shooting-star { position: absolute; height: 2px; background: linear-gradient(-45deg, var(--accent-color), rgba(0, 0, 0, 0)); border-radius: 999px; filter: drop-shadow(0 0 6px var(--accent-color)); animation: shooting-star-anim 15s ease-in-out infinite; }
@keyframes shooting-star-anim { 0% { transform: translateX(0) translateY(0) rotate(135deg); } 100% { transform: translateX(-100vw) translateY(100vh) rotate(135deg); opacity: 0; } }
.particle { position: absolute; background-color: var(--particle-color); border-radius: 50%; animation: float-up 20s infinite linear; filter: blur(0.5px); }
@keyframes float-up { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(-100vh); opacity: 0; } }
</style>