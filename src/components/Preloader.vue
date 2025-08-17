<template>
  <div id="preloader" :class="{ 'loaded': !isLoading }">
    <svg ref="preloaderSvg" width="200" height="200"></svg>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
defineProps({ isLoading: Boolean })
const preloaderSvg = ref(null)
onMounted(() => {
  if (!preloaderSvg.value) return;
  const svg = d3.select(preloaderSvg.value);
  const nodes = d3.range(30).map(i => ({ id: i }));
  const links = d3.range(1, 15).map(i => ({ source: 0, target: i }));
  const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id).distance(40)).force("charge", d3.forceManyBody().strength(-50)).force("center", d3.forceCenter(100, 100));
  const link = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", "var(--border-color)").attr("stroke-opacity", 0);
  const node = svg.append("g").selectAll("circle").data(nodes).join("circle").attr("r", d => d.id === 0 ? 8 : 4).attr("fill", "var(--accent-color)").attr("transform", "scale(0)");
  simulation.on("tick", () => { link.attr("x1", d=>d.source.x).attr("y1", d=>d.source.y).attr("x2", d=>d.target.x).attr("y2", d=>d.target.y); node.attr("cx", d=>d.x).attr("cy", d=>d.y); });
  node.transition().delay((d, i) => i * 50).duration(500).attr("transform", "scale(1)");
  link.transition().delay(500).duration(500).attr("stroke-opacity", 0.6);
})
</script>
<style scoped>
#preloader { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--color-bg); z-index: 1000; display: flex; justify-content: center; align-items: center; transition: opacity 0.8s ease-in-out, visibility 0.8s; }
#preloader.loaded { opacity: 0; visibility: hidden; }
</style>