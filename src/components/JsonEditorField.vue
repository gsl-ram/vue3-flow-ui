<template>
  <div class="json-editor-field">
    <div class="field-toolbar">
      <div class="mode-toggle">
        <button
          class="btn"
          :class="{ 'btn-active': editorMode === 'normal' }"
          @click="editorMode = 'normal'"
        >
          Normal
        </button>
        <button
          class="btn"
          :class="{ 'btn-active': editorMode === 'json' }"
          @click="editorMode = 'json'"
        >
          JSON Editor
        </button>
      </div>
      <span
        class="validation-badge"
        :class="validation.valid ? 'validation-valid' : 'validation-invalid'"
      >
        {{ validation.valid ? 'Valid' : `Invalid: ${validation.error}` }}
      </span>
    </div>
    <div class="editor-area">
      <textarea
        v-show="editorMode === 'normal' || validationMode === 'ejs'"
        v-model="localValue"
        class="editor-textarea"
        :class="{ 'editor-code': editorMode === 'json' && validationMode === 'ejs' }"
        spellcheck="false"
      />
      <JsonEditorVue
        v-show="editorMode === 'json' && validationMode === 'json'"
        v-model="localValue"
        :mode="Mode.text"
        :stringified="true"
        :debounce="300"
        class="editor-json"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import JsonEditorVue from 'json-editor-vue'
import { Mode } from 'vanilla-jsoneditor'
import { validateEjs } from '@/lib/validateEjs'

const props = defineProps<{
  modelValue: string
  validationMode: 'json' | 'ejs'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorMode = ref<'normal' | 'json'>('normal')
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

function validate(text: string): { valid: boolean; error?: string } {
  if (!text.trim()) {
    return { valid: true }
  }
  if (props.validationMode === 'json') {
    try {
      JSON.parse(text)
      return { valid: true }
    } catch (e) {
      return { valid: false, error: (e as Error).message }
    }
  }
  return validateEjs(text)
}

const validation = computed(() => validate(localValue.value))
</script>

<style scoped>
.json-editor-field {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafbfc;
}

.field-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.mode-toggle {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: var(--color-background-mute);
}

.btn-active {
  background: #7c3aed;
  border-color: #6d28d9;
  color: white;
}

.validation-badge {
  font-size: 0.85rem;
  font-weight: 500;
}

.validation-valid {
  color: #059669;
}

.validation-invalid {
  color: #dc2626;
}

.editor-area {
  min-height: 200px;
}

.editor-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: none;
  background: #ffffff;
  color: #1e293b;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.editor-textarea:focus {
  outline: none;
}

.editor-code {
  background: #f8fafc;
}

.editor-json {
  min-height: 200px;
}

.editor-json :deep(.jse-main) {
  min-height: 200px;
}
</style>
