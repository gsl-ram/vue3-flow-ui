<template>
  <div class="code-editor-field">
    <div class="editor-container">
      <CodeEditor
        v-model:value="localValue"
        :language="language"
        :theme="theme"
        :options="editorOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CodeEditor } from 'monaco-editor-vue3'

const props = defineProps<{
  modelValue: string
  language: string
  theme?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    if (localValue.value !== val) {
      localValue.value = val
    }
  },
)

watch(
  localValue,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true },
)

const theme = props.theme ?? 'vs-dark'

const editorOptions = {
  lineNumbers: 'on' as const,
  minimap: { enabled: true },
  wordWrap: 'on' as const,
  fontSize: 14,
  automaticLayout: true,
  scrollBeyondLastLine: false,
}
</script>

<style scoped>
.code-editor-field {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #1e1e1e;
}

.editor-container {
  height: 300px;
}

.editor-container :deep(.monaco-editor) {
  border-radius: 0 0 10px 10px;
}
</style>
