<template>
  <div class="flow-demo">
    <div class="demo-header">
      <h1>Vue Flow Demo</h1>
      <p class="subtitle">
        Interactive node-based graph editor powered by <code>@vue-flow/core</code>
      </p>
    </div>

    <div class="toolbar">
      <button class="btn btn-primary" @click="handleFitView">Fit View</button>
      <button class="btn btn-secondary" @click="handleZoomIn">Zoom In (+)</button>
      <button class="btn btn-secondary" @click="handleZoomOut">Zoom Out (-)</button>
      <button class="btn btn-secondary" @click="handleResetView">Reset View</button>
      <div class="toolbar-divider" />
      <button class="btn btn-accent" @click="addNewNode">+ Add Node</button>
      <button class="btn btn-danger" @click="resetFlow">Reset Flow</button>
    </div>

    <div class="flow-container">
      <div class="flow-wrapper">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-viewport="{ zoom: 1, x: 0, y: 0 }"
          :min-zoom="0.2"
          :max-zoom="4"
          :snap-to-grid="true"
          :snap-grid="[15, 15]"
          fit-view-on-init
          class="vue-flow-instance"
          @node-click="handleNodeClick"
          @edge-click="handleEdgeClick"
          @pane-click="handlePaneClick"
          :defaultEdgeOptions="defaultEdgeOptions"
        >
          <template #node-default="{ data, label }">
            <div class="default-node-content">
              {{ label || data?.label }}
            </div>
          </template>
        </VueFlow>
      </div>
      <div class="code">
        <pre>nodes = {{ nodes }}</pre>
        <pre>edges = {{ edges }}</pre>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import CustomNode from '@/components/flow/CustomNode.vue'

const nodeTypes = {
  custom: markRaw(CustomNode),
}

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: '#7c3aed' },
  pathOptions: { offset: 50, curvature: 0.8 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: '#7c3aed',
  },
}

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const { onConnect, addEdges, onNodeDragStop, fitView, zoomIn, zoomOut, setViewport } = useVueFlow()

onConnect((params) => {
  addEdges(params)
})

const eventLog = ref<string[]>([])

function logEvent(message: string) {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift(`[${time}] ${message}`)
  if (eventLog.value.length > 20) {
    eventLog.value.pop()
  }
}

onNodeDragStop(({ node }) => {
  logEvent(
    `Node "${node.label || node.id}" moved to (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`,
  )
})

onConnect((params) => {
  console.log('onConnect', params)
  logEvent(`Edge connected: ${params.source} → ${params.target}`)
})

function handleNodeClick(_event: MouseEvent, node: Node) {
  logEvent(`Node clicked: "${node.label || node.id}"`)
}

function handleEdgeClick(_event: MouseEvent, edge: Edge) {
  logEvent(`Edge clicked: ${edge.id}`)
}

function handlePaneClick() {
  logEvent('Pane clicked (background)')
}

function handleFitView() {
  fitView({ padding: 0.2, duration: 300 })
  logEvent('Fit view triggered')
}

function handleZoomIn() {
  zoomIn({ duration: 300 })
  logEvent('Zoomed in')
}

function handleZoomOut() {
  zoomOut({ duration: 300 })
  logEvent('Zoomed out')
}

function handleResetView() {
  setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 })
  logEvent('View reset')
}

let nodeCounter = 7

function addNewNode() {
  const id = String(nodeCounter++)
  const taskType = [
    'Enrichment',
    'Cleaning',
    'Transformation',
    'Modeling',
    'Validation',
    'Deployment',
  ]
  const randomTaskType = taskType[Math.floor(Math.random() * taskType.length)]
  const newNode: Node = {
    id,
    label: `New Node ${id}`,
    type: 'custom',
    position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
    data: {
      title: `Task: ${randomTaskType}`,
    },
  }
  nodes.value = [...nodes.value, newNode]
  logEvent(`Added new node: "${newNode.label}"`)
}

function resetFlow() {
  nodes.value = []
  edges.value = []
  nodeCounter = 7
  logEvent('Flow reset to initial state')
}
</script>

<style scoped>
.flow-wrapper {
  height: 600px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.vue-flow-instance :deep(.vue-flow__edge-path) {
  stroke-width: 3;
  transition:
    stroke-width 0.2s ease,
    stroke 0.2s ease;
}

.vue-flow-instance :deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: #6d28d9;
}
</style>
