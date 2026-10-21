<template>
  <select class="project-picker" :value="current" @change="onChange" title="按项目筛选页面数据">
    <option value="">全部项目</option>
    <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
  </select>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectApi } from '../api'

const projects = ref([])
const current = ref('')

try {
  const v = localStorage.getItem('twb_project') || ''
  current.value = /^\d+$/.test(v) ? v : ''
} catch {
  current.value = ''
}

async function load() {
  try {
    const { data } = await projectApi.list()
    projects.value = data || []
  } catch {
    projects.value = []
  }
}

function onChange(e) {
  current.value = e.target.value
  try {
    localStorage.setItem('twb_project', e.target.value)
  } catch {
    /* noop */
  }
  // 通知全局：项目已切换（localStorage 非响应式，通过自定义事件驱动页面重建拉取新数据）
  window.dispatchEvent(new CustomEvent('twb-project-changed', { detail: e.target.value }))
}

onMounted(load)
</script>

<style scoped>
.project-picker {
  min-width: 180px;
  height: 34px;
  padding: 6px 10px;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  background-color: var(--bg-card, #ffffff);
  color: var(--text-main, #1e293b);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.project-picker:hover {
  border-color: var(--border-focus, #059669);
}

.project-picker:focus {
  border-color: var(--border-focus, #059669);
  box-shadow: 0 0 0 3px var(--accent-ring, rgba(5, 150, 105, 0.2));
}
</style>
