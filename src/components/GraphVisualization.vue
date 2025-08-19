<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useBlogStore } from '@/store/blogStore'
import * as d3 from 'd3'
import { useRouter } from 'vue-router'

const props = defineProps({
  nodes: { type: Array, required: true },
  links: { type: Array, required: true },
  activeCategory: { type: String, default: '全部' }
})

const container = ref(null)
const router = useRouter()
let simulation;

// 颜色策略升级: 优先节点自带 categoryColor, 否则回退到全局映射, 再 fallback 到默认调色板
const defaultPalette = d3.scaleOrdinal(["#e6a3a3","#f0c2a3","#aed9b4","#a3cce6","#d4b4e6","#e6d1a3"]);
const blogStore = useBlogStore();
const colorFor = (d) => {
  if (d.categoryColor) return d.categoryColor;
  const mapped = blogStore.categoryColorMap?.[d.category];
  if (mapped) return mapped;
  return defaultPalette(d.category);
}

onMounted(() => {
  if (!container.value) return;

  // ===================== 核心修改点 =====================
  // 为 D3 创建 props 数据的非响应式深拷贝
  const nodesCopy = JSON.parse(JSON.stringify(props.nodes));
  const linksCopy = JSON.parse(JSON.stringify(props.links));
  // ======================================================

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  const svg = d3.select(container.value).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  const g = svg.append("g");

  // 使用数据的副本进行初始化
  simulation = d3.forceSimulation(nodesCopy)
      .force("link", d3.forceLink(linksCopy).id(d => d.id).distance(120).strength(.5))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

  // 使用数据的副本绑定到 D3 元素
  const link = g.append("g").selectAll("line").data(linksCopy).join("line").style("stroke","var(--color-graph-link)").style("stroke-opacity",.8).style("stroke-width", 2);
  const node = g.append("g").selectAll("g").data(nodesCopy).join("g").attr("class", "node");

  node.append("circle").attr("r",12).attr("fill",d=>colorFor(d)).style("stroke","#fff").style("stroke-width","2px").style("cursor","pointer").on("click",(e,d)=>{ if(d.id) router.push(`/article/${d.id}`) });
  node.append("text").text(d=>d.title).attr("dy","2.8em").style("pointer-events","none").style("font-size","12px").style("fill","var(--color-fg)").style("text-anchor","middle").style("paint-order","stroke").style("stroke","var(--color-bg)").style("stroke-width","3px").style("font-weight",500).style("opacity",0).style("transition","opacity .3s");
  node.on("mouseover", function() { d3.select(this).select("text").style("opacity", 1) }).on("mouseout", function() { d3.select(this).select("text").style("opacity", 0) });

  simulation.on("tick",()=>{ link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y); node.attr("transform",d=>`translate(${d.x},${d.y})`); });

  const drag = d3.drag().on("start",(e,d)=>{ if(!e.active) simulation.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; }).on("drag",(e,d)=>{ d.fx=e.x; d.fy=e.y; }).on("end",(e,d)=>{ if(!e.active) simulation.alphaTarget(0); d.fx=null; d.fy=null; });
  node.call(drag);

  const zoom = d3.zoom().scaleExtent([.2,5]).on("zoom",e=>g.attr("transform",e.transform));
  svg.call(zoom);

  watch(() => props.activeCategory, (newCategory) => {
    const allMode = newCategory === '全部'
    node.transition().duration(400).style('opacity', d => allMode || d.category === newCategory ? 1 : 0.12)
    link.transition().duration(400).style('stroke-opacity', l => {
      if (allMode) return 0.6
      return l.source.category === newCategory && l.target.category === newCategory ? 0.7 : 0.03
    })

    // 重新定义聚焦力: 选中分类的节点聚集屏幕中心，其他节点柔和环绕外围
    if (allMode) {
      simulation
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05))
        .force('radial', null)
    } else {
      const centerX = width / 2
      const centerY = height / 2
      simulation
        .force('x', d3.forceX(d => d.category === newCategory ? centerX : centerX + (Math.random()*2-1)*200).strength(d => d.category === newCategory ? 0.2 : 0.02))
        .force('y', d3.forceY(d => d.category === newCategory ? centerY : centerY + (Math.random()*2-1)*200).strength(d => d.category === newCategory ? 0.2 : 0.02))
        .force('radial', d3.forceRadial(d => d.category === newCategory ? 0 : 380, centerX, centerY).strength(d => d.category === newCategory ? 0 : 0.12))
    }
    simulation.alpha(0.9).restart()
  });
});
</script>