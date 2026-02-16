<template>
  <div class="flow-demo">
    <div class="demo-header">
      <h1>Vue Flow Advanced</h1>
      <p class="subtitle">
        Graph view with Background & Controls, plus flat list view. Powered by
        <code>@vue-flow/core</code>, <code>@vue-flow/background</code>,
        <code>@vue-flow/controls</code>
      </p>
    </div>

    <div class="toolbar">
      <div class="view-toggle">
        <button
          class="btn"
          :class="{ 'btn-active': activeView === 'graph' }"
          @click="activeView = 'graph'"
        >
          Graph View
        </button>
        <button
          class="btn"
          :class="{ 'btn-active': activeView === 'list' }"
          @click="activeView = 'list'"
        >
          List View
        </button>
      </div>
      <div class="toolbar-divider" />
      <button class="btn btn-danger" @click="resetFlow">Reset Flow</button>
      <select v-model="selectedTaskType" class="form-select">
        <option v-for="task in taskType" :key="task" :value="task">{{ task }}</option>
      </select>
      <button class="btn btn-accent" @click="addNewNode">+ Add Task</button>
    </div>

    <div class="flow-container">
      <div v-show="activeView === 'graph'" class="flow-wrapper">
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
          <Background variant="dots" :gap="12" />
          <Controls :show-fit-view="true" :show-zoom="true" :show-interactive="true" />
          <template #node-default="{ data, label }">
            <div class="default-node-content">
              {{ label || data?.label }}
            </div>
          </template>
        </VueFlow>
      </div>

      <div v-show="activeView === 'list'" class="list-view">
        <section class="list-section">
          <h2 class="list-section-title">Nodes</h2>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>Title</th>
                  <th>Parent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in nodes" :key="node.id">
                  <td>
                    <code>{{ node.id }}</code>
                  </td>
                  <td>{{ node.label || node.id }}</td>
                  <td>{{ node.data?.title ?? '—' }}</td>
                  <td>
                    <select
                      :value="getCurrentParent(node.id)"
                      @change="setParent(node.id, ($event.target as HTMLSelectElement).value)"
                      class="form-select form-select-sm"
                    >
                      <option
                        v-for="opt in getParentOptions(node.id)"
                        :key="opt.value"
                        :value="opt.value"
                      >
                        {{ opt.label }}
                      </option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm" @click="deleteNode(node.id)">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, nextTick } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Node, Edge, NodeTypesObject, NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
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

const nodes = ref<Node[]>(JSON.parse(JSON.stringify(INITIAL_NODES)))
const edges = ref<Edge[]>(JSON.parse(JSON.stringify(INITIAL_EDGES)))
const activeView = ref<'graph' | 'list'>('graph')

const { onConnect, addEdges, fitView } = useVueFlow()

const eventLog = ref<string[]>([])

function logEvent(message: string) {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift(`[${time}] ${message}`)
  if (eventLog.value.length > 20) {
    eventLog.value.pop()
  }
}

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

function hasParent(nodeId: string): boolean {
  return edges.value.some((edge) => edge.target === nodeId)
}

function getRootNodeIds(): string[] {
  const childIds = new Set(edges.value.map((e) => e.target))
  return nodes.value.map((n) => n.id).filter((id) => !childIds.has(id))
}

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

function getParentOptions(nodeId: string): { value: string; label: string }[] {
  const options = [{ value: '', label: 'None' }]
  for (const n of nodes.value) {
    if (n.id === nodeId) continue
    if (hasPath(nodeId, n.id)) continue
    options.push({ value: n.id, label: String(n.label ?? n.id) })
  }
  return options
}

function getCurrentParent(nodeId: string): string {
  const edge = edges.value.find((e) => e.target === nodeId)
  return edge?.source ?? ''
}

function setParent(nodeId: string, newParentId: string) {
  edges.value = edges.value.filter((e) => e.target !== nodeId)
  if (newParentId) {
    edges.value = [
      ...edges.value,
      {
        id: `vueflow__edge-${newParentId}-${nodeId}`,
        source: newParentId,
        target: nodeId,
        type: 'default',
      },
    ]
  }
}

function deleteNode(nodeId: string) {
  nodes.value = nodes.value.filter((n) => n.id !== nodeId)
  edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId)
}

onConnect((params) => {
  const { source, target } = params
  if (source === target) {
    logEvent(`Connection rejected: cannot connect a node to itself`)
    return
  }
  if (hasParent(target)) {
    logEvent(`Connection rejected: "${target}" already has a parent`)
    return
  }
  if (hasPath(target, source)) {
    logEvent(`Connection rejected: would create a cycle (${source} → ${target})`)
    return
  }
  addEdges(params)
  logEvent(`Edge connected: ${source} → ${target}`)
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
    data: { title: `Task: ${selectedTaskType.value}` },
  }
  nodes.value = [...nodes.value, newNode]
  logEvent(`Added new node: "${newNode.label}"`)
}

function resetFlow() {
  nodes.value = JSON.parse(JSON.stringify(INITIAL_NODES))
  edges.value = JSON.parse(JSON.stringify(INITIAL_EDGES))
  nodeCounter = INITIAL_NODES.length
  logEvent('Flow reset to initial state')
}
</script>

<style scoped>
.flow-demo {
  padding: 1rem 0;
}

.demo-header {
  margin-bottom: 1.5rem;
}

.demo-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text);
  opacity: 0.9;
  font-size: 0.95rem;
}

.subtitle code {
  background: var(--color-background-mute);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 0.25rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: var(--color-background-mute);
  border-color: var(--color-border-hover);
}

.btn-active {
  background: #7c3aed;
  border-color: #6d28d9;
  color: white;
}

.btn-danger {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.btn-danger:hover {
  background: #fee2e2;
}

.btn-accent {
  background: #f3e8ff;
  border-color: #c4b5fd;
  color: #6b21a8;
}

.btn-accent:hover {
  background: #ede9fe;
}

.form-select {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.9rem;
}

.form-select-sm {
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}

/* Parent dropdowns in list view: force light theme for readability */
.data-table .form-select {
  background: #ffffff;
  color: #1e293b;
  border-color: #cbd5e1;
}

.data-table .form-select option {
  background: #ffffff;
  color: #1e293b;
}

.btn-sm {
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
}

.flow-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-section {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.list-section-title {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  margin: 0;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  color: #1e293b;
}

.data-table th,
.data-table td {
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  font-weight: 600;
  background: #f8fafc;
  color: #334155;
}

.data-table td {
  color: #1e293b;
}

.data-table tbody tr:hover {
  background: #f1f5f9;
}

.data-table code {
  background: #e2e8f0;
  color: #0f172a;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}
</style>
