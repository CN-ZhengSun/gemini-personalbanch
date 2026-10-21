<template>
  <div class="fs" ref="root">
    <div class="fs-box" @mousedown.prevent="onMousedown" :title="hint">
      <span v-if="!inputMode" :class="['fs-text', { 'fs-ph': !displayText }]">{{ displayText || placeholder }}</span>
      <input v-else ref="inp" v-model="kw" class="fs-input" :placeholder="placeholder"
        @input="onInput" @blur="onBlur" @keydown.enter.prevent="applyKw" @keydown.esc.prevent="exitInput" />
      <span class="fs-caret" v-if="!inputMode">▾</span>
    </div>
    <div v-if="dropdown" class="fs-menu">
      <div class="fs-item fs-clear" @click="pick('')">
        <span>全部（清除筛选）</span>
      </div>
      <div v-for="op in options" :key="op" class="fs-item" :class="{ 'fs-active': op === modelValue }" @click="pick(op)">{{ op }}</div>
      <div v-if="!options.length" class="fs-empty">无可选项</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'update:search'])

const root = ref(null)
const inp = ref(null)
const inputMode = ref(false)
const dropdown = ref(false)
const kw = ref('')

let lastDown = 0
const displayText = computed(() => (props.modelValue ? props.modelValue : ''))
const hint = '单击下拉选择，双击输入搜索'

function onMousedown() {
  if (inputMode.value) return
  const now = Date.now()
  if (now - lastDown < 300) {
    lastDown = 0
    closeDropdown()
    openInput()
  } else {
    lastDown = now
    if (dropdown.value) closeDropdown()
    else openDropdown()
  }
}

function openDropdown() {
  dropdown.value = true
}

function closeDropdown() {
  dropdown.value = false
}

async function openInput() {
  inputMode.value = true
  kw.value = ''
  await nextTick()
  inp.value?.focus()
  emit('update:search', '')
}

function onInput() {
  emit('update:search', kw.value)
}

function applyKw() {
  emit('update:search', kw.value)
  exitInput()
}

function onBlur() {
  setTimeout(() => {
    inputMode.value = false
  }, 120)
}

function exitInput() {
  inputMode.value = false
  closeDropdown()
}

function pick(val) {
  closeDropdown()
  emit('update:modelValue', val)
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) {
    closeDropdown()
    if (inputMode.value) inputMode.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.fs {
  position: relative;
  display: inline-block;
  min-width: 130px;
  font-family: inherit;
  font-size: 13px;
}

.fs-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 10px;
  height: 34px;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 7px;
  font-size: 13px;
  font-family: inherit;
  line-height: normal;
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #1e293b);
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.fs-box:hover {
  border-color: var(--border-focus, #059669);
}

.fs-text {
  color: var(--text-main, #1e293b);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fs-ph {
  color: var(--text-muted, #94a3b8);
}

.fs-caret {
  color: var(--text-muted, #94a3b8);
  font-size: 11px;
}

.fs-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 13px;
  font-family: inherit;
  padding: 0;
  margin: 0;
  background: transparent;
  color: var(--text-main, #1e293b);
  box-sizing: border-box;
}

.fs-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 40;
  min-width: 100%;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  font-family: inherit;
  font-size: 13px;
}

.fs-item {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-main, #1e293b);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.12s ease;
}

.fs-item:hover {
  background: var(--accent-light, #ecfdf5);
  color: var(--accent-primary, #059669);
}

.fs-item.fs-active {
  background: var(--accent-light, #ecfdf5);
  color: var(--accent-primary, #059669);
  font-weight: 600;
}

.fs-item.fs-clear {
  color: var(--text-muted, #94a3b8);
  border-bottom: 1px solid var(--border-subtle, #f1f5f9);
}

.fs-item.fs-clear:hover {
  background: var(--bg-card-subtle, #f8fafc);
  color: var(--text-main, #64748b);
}

.fs-empty {
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}
</style>
