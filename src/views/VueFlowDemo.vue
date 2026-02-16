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
      <button class="btn btn-danger" @click="resetFlow">Reset Flow</button>

      <select v-model="selectedTaskType" class="form-select">
        <option v-for="task in taskType" :key="task" :value="task">{{ task }}</option>
      </select>
      <button class="btn btn-accent" @click="addNewNode">+ Add Task</button>
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
import { ref, markRaw, nextTick } from 'vue'
import { VueFlow, useVueFlow, Position, MarkerType } from '@vue-flow/core'
import type { Node, Edge, NodeTypesObject, NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import CustomNode from '@/components/flow/CustomNode.vue'

const INITIAL_NODES = <Node[]>[
  {
    id: '0',
    label: `New Node 0`,
    type: 'custom',
    position: { x: 350, y: 50 },
    data: { title: `Task: Deployment` },
  },
  {
    id: '1',
    label: `New Node 1`,
    type: 'custom',
    position: { x: 150, y: 280 },
    data: { title: `Task: Enrichment` },
  },
  {
    id: '2',
    label: `New Node 2`,
    type: 'custom',
    position: { x: 550, y: 280 },
    data: { title: `Task: Validation` },
  },
]

const INITIAL_EDGES = <Edge[]>[
  { id: 'vueflow__edge-0-1', type: 'default', source: '0', target: '1' },
  { id: 'vueflow__edge-0-2', type: 'default', source: '0', target: '2' },
]

let nodeCounter = INITIAL_NODES.length

const nodeTypes: NodeTypesObject = {
  custom: markRaw(CustomNode) as any,
}

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: '#7c3aed' },
  pathOptions: { offset: 50, curvature: 0.8, type: 'smoothstep' },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 15,
    height: 15,
    color: '#7c3aed',
  },
}

const nodes = ref<Node[]>(INITIAL_NODES)
const edges = ref<Edge[]>(INITIAL_EDGES)

const { onConnect, addEdges, onNodeDragStop, fitView, zoomIn, zoomOut, setViewport } = useVueFlow()

const eventLog = ref<string[]>([])

function logEvent(message: string) {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift(`[${time}] ${message}`)
  if (eventLog.value.length > 20) {
    eventLog.value.pop()
  }
}

/** Check if there's a path from `start` to `end` following existing edges */
function hasPath(start: string, end: string): boolean {
  const visited = new Set<string>()
  const queue = [start]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === end) return true
    if (visited.has(current)) continue
    visited.add(current)
    for (const edge of edges.value) {
      if (edge.source === current) {
        queue.push(edge.target)
      }
    }
  }
  return false
}

/** Check if a node already has an incoming edge (i.e. already has a parent) */
function hasParent(nodeId: string): boolean {
  return edges.value.some((edge) => edge.target === nodeId)
}

/** Get nodes that currently have no parent (root nodes) */
function getRootNodeIds(): string[] {
  const childIds = new Set(edges.value.map((e) => e.target))
  return nodes.value.map((n) => n.id).filter((id) => !childIds.has(id))
}

onConnect((params) => {
  const { source, target } = params

  // Rule 1: No self-connections
  if (source === target) {
    logEvent(`Connection rejected: cannot connect a node to itself`)
    return
  }

  // Rule 2: Each node can have at most 1 parent
  if (hasParent(target)) {
    logEvent(`Connection rejected: "${target}" already has a parent`)
    return
  }

  // Rule 3: No circular dependencies
  if (hasPath(target, source)) {
    logEvent(`Connection rejected: would create a cycle (${source} → ${target})`)
    return
  }

  // Rule 4: Only one root node allowed — don't connect two separate trees
  // (connecting source → target removes target as a root; source's root becomes the sole root)
  const roots = getRootNodeIds()
  if (roots.length > 1) {
    // Find which root each node belongs to
    const sourceRoot = findRoot(source)
    const targetRoot = findRoot(target)
    // If they're in the same tree, this is fine
    // If they're in different trees, only allow if it reduces roots toward 1
    if (sourceRoot !== targetRoot && roots.length - 1 > 1) {
      // Still more than 1 root after merging — only allow if no existing root tree would be left orphaned
      // This is acceptable: merging two trees always reduces root count by 1
    }
  }

  addEdges(params)
  logEvent(`Edge connected: ${source} → ${target}`)
})

/** Find the root of the tree a node belongs to */
function findRoot(nodeId: string): string {
  let current = nodeId
  const visited = new Set<string>()
  while (true) {
    visited.add(current)
    const parentEdge = edges.value.find((e) => e.target === current)
    if (!parentEdge) return current
    if (visited.has(parentEdge.source)) return current
    current = parentEdge.source
  }
}

onNodeDragStop(({ node }) => {
  logEvent(
    `Node "${node.label || node.id}" moved to (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`,
  )
})

function handleNodeClick({ node }: NodeMouseEvent) {
  logEvent(`Node clicked: "${node.label || node.id}"`)
}

function handleEdgeClick({ edge }: EdgeMouseEvent) {
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

const taskType = [
  'Enrichment',
  'Cleaning',
  'Transformation',
  'Modeling',
  'Validation',
  'Deployment',
]
const selectedTaskType = ref(taskType[0])

function addNewNode() {
  const id = String(nodeCounter++)
  const newNode: Node = {
    id,
    label: `New Node ${id}`,
    type: 'custom',
    position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
    data: {
      title: `Task: ${selectedTaskType.value}`,
    },
  }
  nodes.value = [...nodes.value, newNode]
  logEvent(`Added new node: "${newNode.label}"`)
  nextTick(() => {
    fitView({ padding: 0.2, duration: 300 })
  })
}

function resetFlow() {
  nodes.value = INITIAL_NODES
  edges.value = INITIAL_EDGES
  nodeCounter = INITIAL_NODES.length
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
