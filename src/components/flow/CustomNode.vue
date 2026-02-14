<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    title: string
    description: string
    emoji: string
  }
}

defineProps<Props>()
</script>

<template>
  <div class="custom-node">
    <Handle type="target" :position="Position.Left" />
    <div class="custom-node-header">
      <span class="custom-node-emoji">{{ data.emoji }}</span>
      <span class="custom-node-title">{{ data.title }}</span>
    </div>
    <p class="custom-node-description">{{ data.description }}</p>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<style scoped>
.custom-node {
  background: linear-gradient(135deg, #f3e8ff, #ede9fe);
  border: 2px solid #a855f7;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  max-width: 220px;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
  transition: box-shadow 0.2s ease;
}

.custom-node:hover {
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.25);
}

.custom-node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.custom-node-emoji {
  font-size: 1.2rem;
}

.custom-node-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #6b21a8;
}

.custom-node-description {
  font-size: 0.75rem;
  color: #7c3aed;
  line-height: 1.4;
  margin: 0;
}

.custom-node :deep(.vue-flow__handle) {
  width: 14px;
  height: 14px;
  background: #a855f7;
  border: 2px solid #7c3aed;
  border-radius: 50%;
}

.custom-node :deep(.vue-flow__handle:hover) {
  background: #7c3aed;
  /* transform: scale(1.3); */
  transition: all 0.15s ease;
}
</style>
