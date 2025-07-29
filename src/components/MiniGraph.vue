<template>
  <div ref="container" class="w-full h-[300px]"></div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import * as d3 from 'd3'
import { useRouter } from 'vue-router'
import { useBlogStore } from '@/store/blogStore'

const props = defineProps({
  postId: { type: String, required: true }
})

const container = ref(null)
const router = useRouter()
const blogStore = useBlogStore()

const relatedData = computed(() => {
  const relatedNodeIds = new Set([props.postId]);
  const relatedLinks = blogStore.graphData.links.filter(l => {
    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
    if (sourceId === props.postId) { relatedNodeIds.add(targetId); return true; }
    if (targetId === props.postId) { relatedNodeIds.add(sourceId); return true; }
    return false;
  });
  const relatedNodes = blogStore.graphData.nodes.filter(n => relatedNodeIds.has(n.id));
  return { nodes: relatedNodes, links: relatedLinks };
});

onMounted(() => {
  if (!container.value || !relatedData.value.nodes.length) return;
  const { nodes, links } = relatedData.value;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  const svg = d3.select(container.value).append("svg").attr("width", width).attr("height", height).attr("viewBox", [-width / 2, -height / 2, width, height]);
  const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(d => d.id).distance(150)).force("charge", d3.forceManyBody().strength(-1e3)).force("center", d3.forceCenter());
  const link = svg.append("g").selectAll("line").data(links).join("line").style("stroke", "var(--border-color)").style("stroke-opacity", .6);
  const node = svg.append("g").selectAll("g").data(nodes).join("g");
  
  node.append("circle").attr("r", d => d.id === props.postId ? 25 : 20).attr("fill", d => d.id === props.postId ? "var(--accent-color)" : "var(--border-color)").style("cursor", "pointer").on("click", (e, d) => { if (d.id !== props.postId && d.id) router.push(`/article/${d.id}`) });
  node.append("text").text(d => d.title).attr("dy", 6).style("pointer-events", "none").style("font-size", "14px").style("fill", "var(--text-color)").style("text-anchor", "middle");
  
  simulation.on("tick", () => { link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y); node.attr("transform", d => `translate(${d.x},${d.y})`); });
});
</script>