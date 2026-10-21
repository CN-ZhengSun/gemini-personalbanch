<template>
  <div class="workbench-page">
    <!-- 工作台顶部栏 -->
    <div class="workbench-header">
      <div>
        <h1 class="page-title">敏捷测试工作台</h1>
        <p class="workbench-sub">测试生命周期实时指标 · 质量概览 · 快捷作业中心</p>
      </div>
      <div class="header-action">
        <span class="picker-prefix">当前项目:</span>
        <ProjectSelect />
      </div>
    </div>

    <!-- 核心指标栅格 -->
    <div class="stats-grid">
      <div class="stat-card clickable" @click="go('/requirements')" title="点击查看需求 PRD">
        <div class="stat-head">
          <span class="stat-title">需求总数</span>
          <span class="stat-icon">📋</span>
        </div>
        <div class="num">{{ s.requirement_total ?? 0 }}</div>
        <div class="lbl">PRD 需求项跟踪 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/cases')" title="点击查看测试用例">
        <div class="stat-head">
          <span class="stat-title">测试用例</span>
          <span class="stat-icon">🧪</span>
        </div>
        <div class="num">{{ s.case_total ?? 0 }}</div>
        <div class="lbl">用例资产库 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/bugs')" title="点击查看缺陷跟踪">
        <div class="stat-head">
          <span class="stat-title">缺陷总数</span>
          <span class="stat-icon">🐛</span>
        </div>
        <div class="num">{{ s.bug_total ?? 0 }}</div>
        <div class="lbl">累计发现缺陷 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/bugs')" title="点击查看未关闭缺陷">
        <div class="stat-head">
          <span class="stat-title">待解决缺陷</span>
          <span class="stat-icon">⚠️</span>
        </div>
        <div class="num text-danger">{{ s.open_bugs ?? 0 }}</div>
        <div class="lbl">需重点跟进 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/executions')" title="点击查看测试执行">
        <div class="stat-head">
          <span class="stat-title">用例执行率</span>
          <span class="stat-icon">▶️</span>
        </div>
        <div class="num">{{ s.exec_rate ?? 0 }}%</div>
        <div class="lbl">已执行占比 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/executions')" title="点击查看测试执行">
        <div class="stat-head">
          <span class="stat-title">用例通过率</span>
          <span class="stat-icon">✓</span>
        </div>
        <div class="num text-success">{{ s.pass_rate ?? 0 }}%</div>
        <div class="lbl">通过质量指标 →</div>
      </div>

      <div class="stat-card clickable" @click="go('/requirements')" title="点击查看需求覆盖">
        <div class="stat-head">
          <span class="stat-title">需求覆盖率</span>
          <span class="stat-icon">🎯</span>
        </div>
        <div class="num text-accent">{{ s.req_coverage ?? 0 }}%</div>
        <div class="lbl">用例关联覆盖 →</div>
      </div>
    </div>

    <!-- 下半部分：快捷入口与执行分布 -->
    <div class="workbench-grid">
      <!-- 快捷作业入口 -->
      <div class="card">
        <div class="card-head">
          <h3>快捷工作入口</h3>
          <span class="muted font-xs">常用模块一键直达</span>
        </div>
        <div class="quick-grid">
          <RouterLink to="/requirements" class="quick-tile">
            <span class="tile-icon">📋</span>
            <div class="tile-info">
              <span class="tile-name">需求 PRD</span>
              <span class="tile-desc">需求思维导图与用例关联</span>
            </div>
          </RouterLink>

          <RouterLink to="/cases" class="quick-tile">
            <span class="tile-icon">🧪</span>
            <div class="tile-info">
              <span class="tile-name">测试用例</span>
              <span class="tile-desc">用例维护、导入导出与脑图</span>
            </div>
          </RouterLink>

          <RouterLink to="/plans" class="quick-tile">
            <span class="tile-icon">📅</span>
            <div class="tile-info">
              <span class="tile-name">测试计划</span>
              <span class="tile-desc">测试轮次规划与进度管控</span>
            </div>
          </RouterLink>

          <RouterLink to="/executions" class="quick-tile">
            <span class="tile-icon">▶️</span>
            <div class="tile-info">
              <span class="tile-name">测试执行</span>
              <span class="tile-desc">用例执行、结果判定与建Bug</span>
            </div>
          </RouterLink>

          <RouterLink to="/bugs" class="quick-tile">
            <span class="tile-icon">🐛</span>
            <div class="tile-info">
              <span class="tile-name">缺陷跟踪</span>
              <span class="tile-desc">缺陷流转、评论与附件跟进</span>
            </div>
          </RouterLink>

          <RouterLink to="/apitest" class="quick-tile">
            <span class="tile-icon">🔌</span>
            <div class="tile-info">
              <span class="tile-name">接口测试工具</span>
              <span class="tile-desc">HTTP接口调试与自动化集合</span>
            </div>
          </RouterLink>

          <RouterLink to="/adbtools" class="quick-tile">
            <span class="tile-icon">📱</span>
            <div class="tile-info">
              <span class="tile-name">ADB 设备工具</span>
              <span class="tile-desc">Android设备调试与Monkey</span>
            </div>
          </RouterLink>

          <RouterLink to="/report" class="quick-tile">
            <span class="tile-icon">📈</span>
            <div class="tile-info">
              <span class="tile-name">质量报表</span>
              <span class="tile-desc">度量报表与质量趋势分析</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- 执行状态分布 -->
      <div class="card">
        <div class="card-head">
          <h3>执行状态分布</h3>
          <span class="muted font-xs">测试结果统计</span>
        </div>
        <div class="distribution-list">
          <div v-for="(v, k) in (s.exec_counts || {})" :key="k" class="dist-row">
            <div class="dist-meta">
              <span class="dist-dot" :style="{ background: color(k) }"></span>
              <span class="dist-label">{{ statusText[k] || k }}</span>
            </div>
            <div class="bar-wrap">
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: pct(k) + '%', background: color(k) }"></div>
              </div>
            </div>
            <div class="dist-val">
              <span class="val-count">{{ v }}</span>
              <span class="val-pct">({{ pct(k) }}%)</span>
            </div>
          </div>
          <div v-if="!Object.keys(s.exec_counts || {}).length" class="empty-state">
            暂无测试执行统计数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '../api'
import ProjectSelect from '../components/ProjectSelect.vue'

const router = useRouter()
const s = ref({})

const statusText = {
  pass: '通过 (Pass)',
  fail: '失败 (Fail)',
  blocked: '阻塞 (Blocked)',
  skipped: '跳过 (Skipped)',
  untested: '未执行 (Untested)'
}

const statusColor = {
  pass: '#059669',
  fail: '#dc2626',
  blocked: '#d97706',
  skipped: '#64748b',
  untested: '#94a3b8'
}

const color = (k) => statusColor[k] || '#94a3b8'

const pct = (k) => {
  const counts = s.value.exec_counts || {}
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return total ? Math.round(((counts[k] || 0) / total) * 100) : 0
}

function go(path) {
  router.push(path)
}

async function load() {
  const pid = localStorage.getItem('twb_project') || undefined
  try {
    const { data } = await dashboardApi.summary(pid)
    s.value = data || {}
  } catch {
    s.value = {}
  }
}

onMounted(load)
watch(() => localStorage.getItem('twb_project'), load)
</script>

<style scoped>
.workbench-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.workbench-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.picker-prefix {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.stat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.stat-icon {
  font-size: 14px;
}

.text-danger {
  color: #dc2626 !important;
}

.text-success {
  color: #059669 !important;
}

.text-accent {
  color: var(--accent-primary) !important;
}

.workbench-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
}

@media (max-width: 960px) {
  .workbench-grid {
    grid-template-columns: 1fr;
  }
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
}

.font-xs {
  font-size: 12px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.quick-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
}

.quick-tile:hover {
  background: var(--bg-card);
  border-color: var(--border-focus);
  transform: translateY(-1px);
  box-shadow: var(--shadow-subtle);
}

.tile-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.tile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-heading);
}

.tile-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dist-meta {
  width: 130px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dist-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dist-label {
  font-size: 12px;
  color: var(--text-main);
  white-space: nowrap;
}

.bar-wrap {
  flex: 1;
}

.bar-track {
  height: 7px;
  background: var(--border-subtle);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dist-val {
  width: 70px;
  text-align: right;
  font-size: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.val-count {
  font-weight: 600;
  color: var(--text-heading);
}

.val-pct {
  color: var(--text-muted);
}

.empty-state {
  padding: 30px 10px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
