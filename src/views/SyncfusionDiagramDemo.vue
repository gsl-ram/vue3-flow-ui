<template>
  <div class="flow-demo">
    <div class="demo-header">
      <h1>Syncfusion Diagram Demo</h1>
      <p class="subtitle">
        Interactive node-based diagram editor powered by
        <code>@syncfusion/ej2-vue-diagrams</code>
      </p>
    </div>

    <div class="toolbar">
      <button class="btn btn-primary" @click="handleFitView">Fit View</button>
      <button class="btn btn-secondary" @click="handleZoomIn">Zoom In (+)</button>
      <button class="btn btn-secondary" @click="handleZoomOut">Zoom Out (-)</button>
      <button class="btn btn-secondary" @click="handleResetView">Reset View</button>
      <div class="toolbar-divider" />
      <button class="btn btn-danger" @click="resetDiagram">Reset Diagram</button>

      <select v-model="selectedTaskType" class="form-select">
        <option v-for="task in taskTypes" :key="task" :value="task">{{ task }}</option>
      </select>
      <button class="btn btn-accent" @click="addNewNode">+ Add Task</button>
    </div>

    <div class="flow-container">
      <div class="flow-wrapper">
        <ejs-diagram
          ref="diagramRef"
          id="syncfusion-diagram"
          :width="'100%'"
          :height="'100%'"
          :nodes="nodes"
          :connectors="connectors"
          :getNodeDefaults="getNodeDefaults"
          :getConnectorDefaults="getConnectorDefaults"
          :snapSettings="snapSettings"
          :scrollSettings="scrollSettings"
        />
      </div>
      <div class="code">
        <pre>nodes = {{ nodesDisplay }}</pre>
        <pre>connectors = {{ connectorsDisplay }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  DiagramComponent as EjsDiagram,
  SnapConstraints,
  NodeConstraints,
  ConnectorConstraints,
} from '@syncfusion/ej2-vue-diagrams'
import type {
  NodeModel,
  ConnectorModel,
  SnapSettingsModel,
  ScrollSettingsModel,
} from '@syncfusion/ej2-diagrams'

import '@syncfusion/ej2-base/styles/material.css'
import '@syncfusion/ej2-popups/styles/material.css'
import '@syncfusion/ej2-splitbuttons/styles/material.css'
import '@syncfusion/ej2-navigations/styles/material.css'
import '@syncfusion/ej2-diagrams/styles/material.css'

const diagramRef = ref<InstanceType<typeof EjsDiagram> | null>(null)

const INITIAL_NODES: NodeModel[] = [
  {
    id: 'node0',
    offsetX: 250,
    offsetY: 250,
    width: 180,
    height: 60,
    annotations: [{ content: 'Task: Deployment' }],
    shape: { type: 'Flow', shape: 'Process' },
    style: { fill: '#f3e8ff', strokeColor: '#a855f7', strokeWidth: 2 },
  },
  {
    id: 'node1',
    offsetX: 550,
    offsetY: 350,
    width: 180,
    height: 60,
    annotations: [{ content: 'Task: Enrichment' }],
    shape: { type: 'Flow', shape: 'Process' },
    style: { fill: '#f3e8ff', strokeColor: '#a855f7', strokeWidth: 2 },
  },
]

const INITIAL_CONNECTORS: ConnectorModel[] = [
  {
    id: 'connector0-1',
    sourceID: 'node0',
    targetID: 'node1',
    type: 'Orthogonal',
    style: { strokeColor: '#7c3aed', strokeWidth: 3 },
    targetDecorator: {
      shape: 'Arrow',
      style: { fill: '#7c3aed', strokeColor: '#7c3aed' },
      width: 12,
      height: 12,
    },
  },
]

const nodes = ref<NodeModel[]>(JSON.parse(JSON.stringify(INITIAL_NODES)))
const connectors = ref<ConnectorModel[]>(JSON.parse(JSON.stringify(INITIAL_CONNECTORS)))

const snapSettings: SnapSettingsModel = {
  constraints: SnapConstraints.ShowLines | SnapConstraints.SnapToLines,
  horizontalGridlines: { lineIntervals: [1, 14, 0.5, 14.5] },
  verticalGridlines: { lineIntervals: [1, 14, 0.5, 14.5] },
}

const scrollSettings: ScrollSettingsModel = {
  scrollLimit: 'Infinity',
}

let nodeCounter = INITIAL_NODES.length

function getNodeDefaults(node: NodeModel): NodeModel {
  node.constraints =
    NodeConstraints.Default | NodeConstraints.AllowDrop
  return node
}

function getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
  connector.constraints =
    ConnectorConstraints.Default | ConnectorConstraints.DragSegmentThumb
  return connector
}

const taskTypes = ['Enrichment', 'Cleaning', 'Transformation', 'Modeling', 'Validation', 'Deployment']
const selectedTaskType = ref(taskTypes[0])

function getDiagram() {
  return (diagramRef.value as any)?.ej2Instances
}

function handleFitView() {
  const diagram = getDiagram()
  if (diagram) {
    diagram.fitToPage({ mode: 'Page', margin: { left: 20, right: 20, top: 20, bottom: 20 } })
  }
}

function handleZoomIn() {
  const diagram = getDiagram()
  if (diagram) {
    diagram.zoom(1.2)
  }
}

function handleZoomOut() {
  const diagram = getDiagram()
  if (diagram) {
    diagram.zoom(0.8)
  }
}

function handleResetView() {
  const diagram = getDiagram()
  if (diagram) {
    diagram.reset()
    diagram.pan(0, 0)
  }
}

function addNewNode() {
  const diagram = getDiagram()
  if (!diagram) return

  const id = `node${nodeCounter++}`
  const newNode: NodeModel = {
    id,
    offsetX: Math.random() * 400 + 100,
    offsetY: Math.random() * 300 + 100,
    width: 180,
    height: 60,
    annotations: [{ content: `Task: ${selectedTaskType.value}` }],
    shape: { type: 'Flow', shape: 'Process' },
    style: { fill: '#f3e8ff', strokeColor: '#a855f7', strokeWidth: 2 },
  }
  diagram.add(newNode)
}

function resetDiagram() {
  const diagram = getDiagram()
  if (!diagram) return

  diagram.clear()
  nodeCounter = INITIAL_NODES.length

  const freshNodes = JSON.parse(JSON.stringify(INITIAL_NODES))
  const freshConnectors = JSON.parse(JSON.stringify(INITIAL_CONNECTORS))

  for (const node of freshNodes) {
    diagram.add(node)
  }
  for (const connector of freshConnectors) {
    diagram.add(connector)
  }

  diagram.fitToPage({ mode: 'Page', margin: { left: 20, right: 20, top: 20, bottom: 20 } })
}

const nodesDisplay = computed(() => {
  const diagram = getDiagram()
  if (diagram) {
    return diagram.nodes.map((n: any) => ({
      id: n.id,
      offsetX: Math.round(n.offsetX),
      offsetY: Math.round(n.offsetY),
      annotation: n.annotations?.[0]?.content,
    }))
  }
  return nodes.value.map((n) => ({
    id: n.id,
    offsetX: n.offsetX,
    offsetY: n.offsetY,
    annotation: n.annotations?.[0]?.content,
  }))
})

const connectorsDisplay = computed(() => {
  const diagram = getDiagram()
  if (diagram) {
    return diagram.connectors.map((c: any) => ({
      id: c.id,
      sourceID: c.sourceID,
      targetID: c.targetID,
    }))
  }
  return connectors.value.map((c) => ({
    id: c.id,
    sourceID: c.sourceID,
    targetID: c.targetID,
  }))
})

onMounted(() => {
  setTimeout(() => {
    handleFitView()
  }, 300)
})
</script>

<style scoped>
.flow-wrapper {
  height: 600px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}
</style>
