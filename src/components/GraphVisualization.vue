<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

// 这部分颜色和分类的逻辑保持不变
const colors = d3.scaleOrdinal(["#e6a3a3","#f0c2a3","#aed9b4","#a3cce6"]);
const categories = [...new Set(props.nodes.map(n => n.category))];
colors.domain(categories);

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
  const link = g.append("g").selectAll("line").data(linksCopy).join("line").style("stroke","var(--graph-link-color)").style("stroke-opacity",.8).style("stroke-width", 2);
  const node = g.append("g").selectAll("g").data(nodesCopy).join("g").attr("class", "node");

  node.append("circle").attr("r",12).attr("fill",d=>colors(d.category)).style("stroke","#fff").style("stroke-width","2px").style("cursor","pointer").on("click",(e,d)=>{ if(d.id) router.push(`/article/${d.id}`) });
  node.append("text").text(d=>d.title).attr("dy","2.8em").style("pointer-events","none").style("font-size","12px").style("fill","var(--text-color)").style("text-anchor","middle").style("paint-order","stroke").style("stroke","var(--bg-color)").style("stroke-width","3px").style("font-weight",500).style("opacity",0).style("transition","opacity .3s");
  node.on("mouseover", function() { d3.select(this).select("text").style("opacity", 1) }).on("mouseout", function() { d3.select(this).select("text").style("opacity", 0) });

  simulation.on("tick",()=>{ link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y); node.attr("transform",d=>`translate(${d.x},${d.y})`); });

  const drag = d3.drag().on("start",(e,d)=>{ if(!e.active) simulation.alphaTarget(.3).restart(); d.fx=d.x; d.fy=d.y; }).on("drag",(e,d)=>{ d.fx=e.x; d.fy=e.y; }).on("end",(e,d)=>{ if(!e.active) simulation.alphaTarget(0); d.fx=null; d.fy=null; });
  node.call(drag);

  const zoom = d3.zoom().scaleExtent([.2,5]).on("zoom",e=>g.attr("transform",e.transform));
  svg.call(zoom);

  watch(() => props.activeCategory, (newCategory) => {
    node.transition().duration(500).style("opacity",d=>"全部"===newCategory||d.category===newCategory?1:.1);

    // 【额外修正】你之前的 watch 逻辑也有一个小问题，这里也一并修正了
    // 原代码: "全部"===newCategory?.8  这是错误的
    link.transition().duration(500).style("stroke-opacity", l => {
      if (newCategory === '全部') return 0.8;
      // 注意：D3修改了links副本，source和target现在是完整的节点对象
      return l.source.category === newCategory && l.target.category === newCategory ? 0.9 : 0.05;
    });

    if("全部"===newCategory){
      simulation.force("x", d3.forceX(width / 2).strength(0.05));
      simulation.force("y", d3.forceY(height / 2).strength(0.05));
    } else {
      simulation.force("x", d3.forceX(d => d.category === newCategory ? width / 4 : .8 * width).strength(.1));
      simulation.force("y", d3.forceY(d => d.category === newCategory ? height / 3 : height * 0.66).strength(.1));
    }
    simulation.alpha(1).restart();
  });
});
</script>