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

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    label: 'Start',
    position: { x: 250, y: 0 },
    style: {
      background: '#6366f1',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      padding: '12px 24px',
    },
  },
  {
    id: '2',
    label: 'Process A',
    position: { x: 100, y: 120 },
    style: {
      background: '#f0f9ff',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      padding: '10px 20px',
    },
  },
  {
    id: '3',
    label: 'Process B',
    position: { x: 400, y: 120 },
    style: {
      background: '#fefce8',
      border: '2px solid #eab308',
      borderRadius: '8px',
      padding: '10px 20px',
    },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 80, y: 260 },
    data: {
      title: 'Custom Node',
      description: 'Drag me around! This is a custom node component.',
      emoji: '🧩',
    },
  },
  {
    id: '5',
    label: 'Decision',
    position: { x: 400, y: 260 },
    style: {
      background: '#fef2f2',
      border: '2px solid #ef4444',
      borderRadius: '50%',
      width: '100px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
    },
  },
  {
    id: '6',
    type: 'output',
    label: 'Result',
    position: { x: 250, y: 420 },
    style: {
      background: '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '600',
      padding: '12px 24px',
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
    type: 'step',
    style: { stroke: '#eab308', strokeWidth: 2 },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    type: 'smoothstep',
    label: 'Yes',
    labelStyle: { fontWeight: '600', fill: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: MarkerType.ArrowClosed,
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    type: 'smoothstep',
    label: 'No',
    labelStyle: { fontWeight: '600', fill: '#ef4444' },
    style: { stroke: '#ef4444', strokeWidth: 2 },
    markerEnd: MarkerType.ArrowClosed,
  },
]

const nodes = ref<Node[]>(initialNodes)
const edges = ref<Edge[]>(initialEdges)

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
  const newNode: Node = {
    id,
    label: `New Node ${id}`,
    position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
    style: {
      background: '#f3e8ff',
      border: '2px solid #a855f7',
      borderRadius: '8px',
      padding: '10px 20px',
    },
  }
  nodes.value = [...nodes.value, newNode]
  logEvent(`Added new node: "${newNode.label}"`)
}

function resetFlow() {
  nodes.value = [...initialNodes]
  edges.value = [...initialEdges]
  nodeCounter = 7
  logEvent('Flow reset to initial state')
}
</script>

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
        >
          <template #node-default="{ data, label }">
            <div class="default-node-content">
              {{ label || data?.label }}
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flow-demo {
}

.demo-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.demo-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.subtitle code {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #6366f1;
}

.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-green {
  background: #dcfce7;
  color: #15803d;
}
.badge-purple {
  background: #f3e8ff;
  color: #7e22ce;
}
.badge-yellow {
  background: #fefce8;
  color: #a16207;
}
.badge-red {
  background: #fee2e2;
  color: #dc2626;
}
.badge-indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #cbd5e1;
  margin: 0 0.25rem;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-accent {
  background: #a855f7;
  color: white;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background: #fecaca;
}

.flow-wrapper {
  height: 600px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.vue-flow-instance {
  width: 100%;
  height: 100%;
}

.default-node-content {
  font-size: 0.9rem;
}

.event-log {
  background: #1e293b;
  border-radius: 12px;
  padding: 1rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.event-log h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.log-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.log-entries {
  flex: 1;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.6;
}

.log-entry {
  padding: 4px 0;
  border-bottom: 1px solid #334155;
  color: #a5f3fc;
}

.log-entry:nth-child(odd) {
  color: #c4b5fd;
}

.log-empty {
  color: #64748b;
  font-style: italic;
  text-align: center;
  margin-top: 2rem;
}

.features-section {
  margin-top: 2rem;
}

.features-section h2 {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.feature-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.4rem;
}

.feature-card p {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .flow-container {
    grid-template-columns: 1fr;
  }

  .flow-wrapper {
    height: 400px;
  }

  .event-log {
    max-height: 200px;
  }
}
</style>
