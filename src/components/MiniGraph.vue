<template>
  <div class="context-compass-container" ref="containerRef">
    <div v-if="hasLinks" class="compass-layout">
      <!-- 左侧：入链 -->
      <div class="link-column">
        <h4 class="column-title">引我至此</h4>
        <div class="cards-list">
          <div
              v-for="link in incomingLinks"
              :key="link.id"
              :ref="el => setCardRef(link.id, el)"
              class="link-card"
              @mouseover="onLinkHover(link.id)"
              @mouseleave="onLinkLeave(link.id)"
              @click="navigateTo(link.id)"
          >
            {{ link.title }}
          </div>
        </div>
      </div>

      <!-- 中间：SVG绘图区 -->
      <div class="svg-wrapper">
        <svg ref="svgRef" width="100%" height="100%"></svg>
      </div>

      <!-- 右侧：出链 -->
      <div class="link-column">
        <h4 class="column-title">由此出发</h4>
        <div class="cards-list">
          <div
              v-for="link in outgoingLinks"
              :key="link.id"
              :ref="el => setCardRef(link.id, el)"
              class="link-card"
              @mouseover="onLinkHover(link.id)"
              @mouseleave="onLinkLeave(link.id)"
              @click="navigateTo(link.id)"
          >
            {{ link.title }}
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-links-message">
      <p>暂无思绪连接...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useBlogStore } from '@/store/blogStore';
import * as d3 from 'd3';

const props = defineProps({
  postId: { type: [String, Number], required: true }
});

const router = useRouter();
const blogStore = useBlogStore();

const containerRef = ref(null);
const svgRef = ref(null);
const cardRefs = ref(new Map());

const setCardRef = (id, el) => {
  if (el) {
    cardRefs.value.set(String(id), el);
  }
};

const stringPostId = computed(() => String(props.postId));

const allLinks = computed(() => blogStore.graphData.links);
const allNodes = computed(() => blogStore.graphData.nodes);

const incomingLinks = computed(() =>
    allLinks.value
        .filter(l => String(l.target) === stringPostId.value)
        .map(l => allNodes.value.find(n => String(n.id) === String(l.source)))
        .filter(Boolean) // 过滤掉可能找不到的节点
);

const outgoingLinks = computed(() =>
    allLinks.value
        .filter(l => String(l.source) === stringPostId.value)
        .map(l => allNodes.value.find(n => String(n.id) === String(l.target)))
        .filter(Boolean) // 过滤掉可能找不到的节点
);

const hasLinks = computed(() => incomingLinks.value.length > 0 || outgoingLinks.value.length > 0);

const navigateTo = (id) => {
  if (id) router.push(`/article/${id}`);
};

const onLinkHover = (id) => {
  if (!id) return;
  d3.select(svgRef.value).select(`#path-${id}`)
      .transition().duration(200)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.9);
};

const onLinkLeave = (id) => {
  if (!id) return;
  d3.select(svgRef.value).select(`#path-${id}`)
      .transition().duration(300)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4);
};

const drawConnections = () => {
  if (!svgRef.value || !containerRef.value) return;

  const svg = d3.select(svgRef.value);
  svg.selectAll('path').remove(); // 清空旧路径

  const containerRect = containerRef.value.getBoundingClientRect();
  const centralX = containerRect.width / 2;

  const allVisibleLinks = [...incomingLinks.value, ...outgoingLinks.value];

  const pathData = allVisibleLinks.map(link => {
    const cardEl = cardRefs.value.get(String(link.id));
    if (!cardEl) return null;

    const cardRect = cardEl.getBoundingClientRect();
    const isIncoming = incomingLinks.value.some(l => String(l.id) === String(link.id));

    const startX = isIncoming ? cardRect.right - containerRect.left : centralX;
    const startY = cardRect.top - containerRect.top + cardRect.height / 2;

    const endX = isIncoming ? centralX : cardRect.left - containerRect.left;
    const endY = startY;

    return {
      id: link.id,
      source: [startX, startY],
      target: [endX, endY]
    };
  }).filter(Boolean);

  const linkGenerator = d3.linkHorizontal()
      .x(d => d[0])
      .y(d => d[1]);

  svg.selectAll('path')
      .data(pathData)
      .join(
          enter => {
            const path = enter.append('path')
                .attr('id', d => `path-${d.id}`)
                .attr('d', linkGenerator)
                .attr('fill', 'none')
                .attr('stroke', 'var(--accent-color)')
                .attr('stroke-width', 1.5)
                .attr('stroke-opacity', 0.4);

            // 动画入场效果
            path.each(function() {
              const length = this.getTotalLength();
              d3.select(this)
                  .attr('stroke-dasharray', `${length} ${length}`)
                  .attr('stroke-dashoffset', length)
                  .transition().duration(800).ease(d3.easeCubicOut)
                  .attr('stroke-dashoffset', 0);
            });
          }
      );
};

watch(hasLinks, (newValue) => {
  if (newValue) {
    nextTick(() => {
      // 在DOM更新后绘制连接线
      drawConnections();
    });
  }
}, { immediate: true });
</script>

<style scoped>
.context-compass-container {
  width: 100%;
  min-height: 250px;
  position: relative;
}

.compass-layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: flex-start;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.svg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none; /* 让SVG不阻挡鼠标事件 */
}

.link-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-fg-subtle);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-column:first-child .cards-list {
  align-items: flex-end; /* 左侧卡片靠右对齐 */
}

.link-column:last-child .cards-list {
  align-items: flex-start; /* 右侧卡片靠左对齐 */
}

.link-card {
  background-color: var(--color-bg-muted);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  color: var(--color-fg);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-card:hover {
  transform: translateY(-2px) scale(1.02);
  background-color: var(--color-bg);
  border-color: var(--color-accent);
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  color: var(--accent-color-dark);
}

.no-links-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  color: var(--color-fg-subtle);
  font-style: italic;
}
</style>