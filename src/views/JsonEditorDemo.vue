<template>
  <div class="json-editor-demo">
    <div class="demo-header">
      <h1>JSON Editor Demo</h1>
      <p class="subtitle">
        Toggleable editor field with two-way binding. Validate as
        <code>JSON</code> or <code>EJS</code> based on props.
      </p>
    </div>

    <div class="demo-sections">
      <section class="demo-section">
        <h2 class="section-title">JSON Field</h2>
        <p class="section-desc">Validation mode: <code>json</code></p>
        <JsonEditorField v-model="jsonText" validation-mode="json" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">EJS Field</h2>
        <p class="section-desc">Validation mode: <code>ejs</code></p>
        <JsonEditorField v-model="ejsText" validation-mode="ejs" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JsonEditorField from '@/components/JsonEditorField.vue'

const jsonText = ref('{\n  "name": "test",\n  "count": 42\n}')
const ejsText = ref('Hello <%= name %>!\nCount: <%= count %>')
</script>

<style scoped>
.json-editor-demo {
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

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-section {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  background: #fafbfc;
}

.section-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.section-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1rem 0;
}

.section-desc code {
  background: #e2e8f0;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85em;
  color: #1e293b;
}
</style>
