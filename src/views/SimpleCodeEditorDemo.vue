<template>
  <div class="simple-code-editor-demo">
    <div class="demo-header">
      <h1>Simple Code Editor Demo</h1>
      <p class="subtitle">
        simple-code-editor (highlight.js) with line numbers and syntax highlighting.
        Supports JSON, EJS, Mustache, HTML, JavaScript, and plain text.
      </p>
    </div>

    <div class="demo-sections">
      <section class="demo-section">
        <h2 class="section-title">JSON</h2>
        <p class="section-desc">Syntax highlighting for keys and values</p>
        <SimpleCodeEditorField v-model="jsonContent" language="json" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">EJS</h2>
        <p class="section-desc">Embedded JavaScript templates</p>
        <SimpleCodeEditorField v-model="ejsContent" language="html" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">Mustache</h2>
        <p class="section-desc">Mustache/Handlebars-style templates</p>
        <SimpleCodeEditorField v-model="mustacheContent" language="html" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">HTML</h2>
        <p class="section-desc">HTML markup</p>
        <SimpleCodeEditorField v-model="htmlContent" language="html" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">JavaScript</h2>
        <p class="section-desc">JavaScript code</p>
        <SimpleCodeEditorField v-model="jsContent" language="javascript" />
      </section>

      <section class="demo-section">
        <h2 class="section-title">Plain Text</h2>
        <p class="section-desc">Simple string content</p>
        <SimpleCodeEditorField v-model="plainContent" language="plaintext" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SimpleCodeEditorField from '@/components/SimpleCodeEditorField.vue'

const jsonContent = ref(`{
  "name": "test",
  "count": 42,
  "items": ["a", "b", "c"]
}`)

const ejsContent = ref(`Hello <%= name %>!
Count: <%= count %>
<% items.forEach(item => { %>
  - <%= item %>
<% }) %>`)

const mustacheContent = ref(`Hello {{name}}!
Count: {{count}}
{{#items}}
  - {{.}}
{{/items}}`)

const htmlContent = ref(`<div class="box">
  <h1>Title</h1>
  <p>Content here</p>
</div>`)

const jsContent = ref(`const x = 1;
const obj = { a: 1, b: 2 };
function add(a, b) {
  return a + b;
}`)

const plainContent = ref(`Simple string content
No syntax highlighting
Multiple lines`)
</script>

<style scoped>
.simple-code-editor-demo {
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
