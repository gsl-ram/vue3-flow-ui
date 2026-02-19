<template>
  <div class="simple-code-editor-field">
    <CodeEditor
      v-model="localValue"
      :languages="languagesProp"
      :line-nums="true"
      height="300px"
      width="100%"
      theme="github-dark"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import CodeEditor from 'simple-code-editor'

const props = defineProps<{
  modelValue: string
  language: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)

const languageDisplayNames: Record<string, string> = {
  json: 'JSON',
  html: 'HTML',
  javascript: 'JS',
  plaintext: 'Text',
}

const languagesProp = computed(() => {
  const lang = props.language
  const display = languageDisplayNames[lang] ?? lang
  return [[lang, display]]
})

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
</script>

<style scoped>
.simple-code-editor-field {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
</style>
