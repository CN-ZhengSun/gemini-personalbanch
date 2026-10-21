<template>
  <div class="layout" :data-theme="currentTheme" v-if="authed">
    <!-- 侧边导航栏 -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="logo-row">
        <div class="logo-box">
          <span class="logo-icon">🧪</span>
          <div class="logo-text label">
            <span class="brand-title">Personal-Bench</span>
            <span class="brand-sub">测试工作台</span>
          </div>
        </div>
        <button
          class="collapse-btn"
          :title="collapsed ? '展开侧边菜单' : '收起侧边菜单'"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '▶' : '◀' }}
        </button>
      </div>

      <nav class="menu">
        <template v-for="group in menuGroups" :key="group.key">
          <div class="group-title" :title="group.name">
            <span class="label">{{ group.name }}</span>
            <div class="group-line" v-if="collapsed"></div>
          </div>
          <RouterLink
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :title="item.name"
          >
            <span class="item-icon">{{ getMenuIcon(item.path, item.name) }}</span>
            <span class="item-name label">{{ item.name }}</span>
          </RouterLink>
        </template>
      </nav>

      <!-- 侧边栏底部版本标识 -->
      <div class="sidebar-foot" v-if="!collapsed">
        <span class="foot-tag">Personal-Bench v2.0</span>
      </div>
    </aside>

    <!-- 主视口区域 -->
    <div class="main-viewport">
      <!-- 顶部工作台状态栏 -->
      <header class="topbar">
        <!-- 左侧：面包屑 / 当前定位 -->
        <div class="topbar-left">
          <span class="location-crumb">
            <span class="crumb-parent">{{ currentGroupTitle }}</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{{ currentPageTitle }}</span>
          </span>
        </div>

        <!-- 右侧：主题切换器 + 账号信息 + 操作 -->
        <div class="topbar-right">
          <!-- 5种风格主题切换器 -->
          <div class="theme-dropdown-wrap" ref="themePickerRef">
            <button
              class="theme-toggle-btn"
              @click="showThemeMenu = !showThemeMenu"
              title="切换界面风格主题（5种颜色风格）"
            >
              <span class="theme-swatch" :style="{ background: activeThemeObj.swatch }"></span>
              <span class="theme-label">{{ activeThemeObj.name }}</span>
              <span class="theme-badge" v-if="activeThemeObj.id === 'fresh-mint'">主版本</span>
              <span class="theme-arrow">▾</span>
            </button>

            <!-- 主题下拉选择面板 -->
            <div v-if="showThemeMenu" class="theme-menu-popover">
              <div class="popover-head">
                <span class="popover-title">切换界面风格</span>
                <span class="popover-tip">5 种精心调配配色</span>
              </div>
              <div class="theme-list">
                <div
                  v-for="th in THEMES"
                  :key="th.id"
                  class="theme-card-option"
                  :class="{ active: currentTheme === th.id }"
                  @click="selectTheme(th.id)"
                >
                  <span class="swatch-bubble" :style="{ background: th.swatch }">
                    <span v-if="currentTheme === th.id" class="check-mark">✓</span>
                  </span>
                  <div class="theme-info">
                    <div class="theme-title-row">
                      <span class="theme-opt-name">{{ th.name }}</span>
                      <span class="theme-opt-badge" v-if="th.badge">{{ th.badge }}</span>
                    </div>
                    <span class="theme-opt-desc">{{ th.tagline }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 用户名与角色卡 -->
          <div class="user-chip" title="当前登录账户">
            <span class="user-avatar">{{ (user.display_name || user.username || '用')[0]?.toUpperCase() }}</span>
            <div class="user-meta">
              <span class="user-name">{{ user.display_name || user.username || '测试工程师' }}</span>
              <span class="user-role">{{ roleText }}</span>
            </div>
          </div>

          <!-- 修改密码 -->
          <button class="top-action-btn" @click="showPassword = true" title="修改账户密码">
            修改密码
          </button>

          <!-- 退出登录 -->
          <button class="top-action-btn btn-logout" @click="handleLogout" title="退出当前账户">
            退出登录
          </button>
        </div>
      </header>

      <!-- 内容页面路由视图 -->
      <main class="content">
        <RouterView v-slot="{ Component }">
          <KeepAlive :max="30">
            <component :is="Component" :key="pageKey" />
          </KeepAlive>
        </RouterView>
      </main>
    </div>

    <!-- 修改密码模态弹窗 -->
    <div v-if="showPassword" class="modal-mask" @click.self="showPassword = false">
      <div class="modal" style="width: 400px">
        <h3>修改账户密码</h3>
        <div class="field">
          <label>当前密码</label>
          <input v-model="passwordForm.current_password" type="password" placeholder="请输入当前密码" />
        </div>
        <div class="field">
          <label>新密码（至少 8 位）</label>
          <input v-model="passwordForm.new_password" type="password" placeholder="请输入新密码" />
        </div>
        <div class="field">
          <label>确认新密码</label>
          <input v-model="passwordConfirm" type="password" placeholder="请再次输入新密码" />
        </div>
        <div class="actions">
          <button class="btn btn-gray" @click="showPassword = false">取消</button>
          <button class="btn" @click="changePassword">保存新密码</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 未认证时直接展示路由组件（如登录页） -->
  <RouterView v-else />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi, menuApi } from './api'
import { THEMES, getInitialTheme, applyTheme } from './utils/theme'

const router = useRouter()
const route = useRoute()

// 主题状态
const currentTheme = ref(getInitialTheme())
const showThemeMenu = ref(false)
const themePickerRef = ref(null)

const activeThemeObj = computed(() => {
  return THEMES.find(t => t.id === currentTheme.value) || THEMES[0]
})

function selectTheme(themeId) {
  currentTheme.value = applyTheme(themeId)
  showThemeMenu.value = false
}

function handleOutsideClick(e) {
  if (themePickerRef.value && !themePickerRef.value.contains(e.target)) {
    showThemeMenu.value = false
  }
}

// 身份与会话状态
const authed = ref(!!localStorage.getItem('twb_authenticated'))
const user = ref({})
const showPassword = ref(false)
const collapsed = ref(localStorage.getItem('twb_sidebar_collapsed') === '1')
const passwordForm = ref({ current_password: '', new_password: '' })
const passwordConfirm = ref('')

// 会话版本号：退出登录时 +1，使已缓存页面状态失效
const sessionTick = ref(0)
// 项目切换版本号：任一页面内切换项目（localStorage twb_project）后 +1，重建组件拉取新项目数据
const projectTick = ref(0)

function onProjectChanged() {
  projectTick.value++
}

function onStorageProject(e) {
  if (e.key === 'twb_project') projectTick.value++
}

// 页面缓存键：路由路径 + 项目版本 + 会话版本
const pageKey = computed(() => `${route.path}|${projectTick.value}|${sessionTick.value}`)

const roleMap = {
  admin: '系统管理员',
  manager: '测试负责人',
  tester: '测试工程师',
  dev: '研发工程师',
  viewer: '访客只读'
}
const roleText = computed(() => roleMap[user.value.role] || user.value.role || '测试工程师')

// ---------- 菜单配置与驱动 ----------
const DEFAULT_MENU = [
  {
    key: 'test_manage',
    name: '测试管理',
    items: [
      { path: '/workbench', name: '工作台' },
      { path: '/requirements', name: '需求 PRD' },
      { path: '/cases', name: '测试用例' },
      { path: '/plans', name: '测试计划' },
      { path: '/executions', name: '测试执行' },
      { path: '/bugs', name: '缺陷跟踪' },
      { path: '/projects', name: '项目管理' },
      { path: '/report', name: '质量报表' },
      { path: '/automation', name: '自动化脚本' },
      { path: '/releases', name: '版本与环境' }
    ]
  },
  {
    key: 'test_tools',
    name: '测试工具',
    items: [
      { path: '/apitest', name: '接口测试工具' },
      { path: '/tracking', name: '埋点监控' },
      { path: '/adbtools', name: 'ADB 工具' },
      { path: '/jmeter', name: 'JMeter 工具' }
    ]
  },
  {
    key: 'assets_ai',
    name: '资产与 AI',
    items: [
      { path: '/knowledge', name: '知识库' },
      { path: '/skills', name: 'SKILL 管理' },
      { path: '/ai', name: 'AI 模型配置' },
      { path: '/menu-manage', name: '菜单管理' }
    ]
  }
]

const menuGroups = ref(DEFAULT_MENU)

const ICONS_MAP = {
  '/workbench': '📊',
  '/requirements': '📋',
  '/cases': '🧪',
  '/plans': '📅',
  '/executions': '▶️',
  '/bugs': '🐛',
  '/projects': '📁',
  '/report': '📈',
  '/automation': '⚡',
  '/releases': '🏷️',
  '/apitest': '🔌',
  '/tracking': '📍',
  '/adbtools': '📱',
  '/jmeter': '⏱️',
  '/knowledge': '📚',
  '/skills': '🧠',
  '/ai': '🤖',
  '/menu-manage': '⚙️'
}

function getMenuIcon(path, name) {
  if (ICONS_MAP[path]) return ICONS_MAP[path]
  if (name?.includes('工作台')) return '📊'
  if (name?.includes('需求')) return '📋'
  if (name?.includes('用例')) return '🧪'
  if (name?.includes('计划')) return '📅'
  if (name?.includes('执行')) return '▶️'
  if (name?.includes('缺陷') || name?.includes('Bug')) return '🐛'
  if (name?.includes('项目')) return '📁'
  if (name?.includes('报表') || name?.includes('质量')) return '📈'
  if (name?.includes('自动')) return '⚡'
  if (name?.includes('版本')) return '🏷️'
  if (name?.includes('接口')) return '🔌'
  if (name?.includes('埋点')) return '📍'
  if (name?.includes('ADB')) return '📱'
  if (name?.includes('JMeter')) return '⏱️'
  if (name?.includes('知识')) return '📚'
  if (name?.includes('Skill')) return '🧠'
  if (name?.includes('AI')) return '🤖'
  if (name?.includes('菜单')) return '⚙️'
  return '📄'
}

// 当前面包屑定位计算
const currentGroupTitle = computed(() => {
  for (const group of menuGroups.value) {
    if (group.items?.some(it => it.path === route.path)) {
      return group.name
    }
  }
  return '测试管理'
})

const currentPageTitle = computed(() => {
  for (const group of menuGroups.value) {
    const found = group.items?.find(it => it.path === route.path)
    if (found) return found.name
  }
  return route.meta?.title || '测试中心'
})

async function loadMenu() {
  try {
    const { data } = await menuApi.list()
    const groups = []
    let cur = null
    for (const row of data) {
      if (row.is_group) {
        cur = { key: row.group_key, name: row.name, items: [] }
        groups.push(cur)
      } else if (cur) {
        cur.items.push({ path: row.menu_key, name: row.name })
      }
    }
    if (groups.length && groups.some(g => g.items.length)) {
      menuGroups.value = groups
    }
  } catch {
    /* 拉取失败时保持内置默认菜单 */
  }
}

function onMenuChanged() {
  loadMenu()
}

watch(collapsed, v => localStorage.setItem('twb_sidebar_collapsed', v ? '1' : '0'))

function loadUser() {
  try {
    user.value = JSON.parse(localStorage.getItem('twb_user') || '{}')
  } catch {
    user.value = {}
  }
}

async function handleLogout() {
  const confirmed = window.$confirm
    ? await window.$confirm('确定要退出当前账号并返回登录页面吗？', { okText: '退出登录', danger: true })
    : true
  if (!confirmed) return
  await logout()
}

async function logout() {
  try {
    await authApi.logout()
  } catch {
    /* 本地服务异常时仍清理页面状态 */
  }
  sessionTick.value++
  authed.value = false
  localStorage.removeItem('twb_authenticated')
  localStorage.removeItem('twb_user')
  router.push('/login')
}

async function changePassword() {
  if (!passwordForm.value.current_password) return window.$toast.warning('请输入当前密码')
  if (passwordForm.value.new_password.length < 8) return window.$toast.warning('新密码至少 8 位')
  if (passwordForm.value.new_password !== passwordConfirm.value) return window.$toast.warning('两次输入的新密码不一致')
  try {
    await authApi.changePassword(passwordForm.value)
    showPassword.value = false
    passwordForm.value = { current_password: '', new_password: '' }
    passwordConfirm.value = ''
    window.$toast.success('密码已修改，当前设备保持登录')
  } catch (e) {
    window.$toast.error(e.response?.data?.detail || '密码修改失败')
  }
}

async function bootstrap() {
  try {
    const { data } = await authApi.me()
    user.value = data
    authed.value = true
    localStorage.setItem('twb_authenticated', '1')
    localStorage.setItem('twb_user', JSON.stringify(data))
  } catch {
    authed.value = false
    localStorage.removeItem('twb_authenticated')
    localStorage.removeItem('twb_user')
    if (route.path !== '/login') router.replace('/login')
  }
}

onMounted(() => {
  applyTheme(currentTheme.value)
  loadUser()
  bootstrap()
  loadMenu()
  window.addEventListener('twb-menu-changed', onMenuChanged)
  window.addEventListener('twb-project-changed', onProjectChanged)
  window.addEventListener('storage', onStorageProject)
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  window.removeEventListener('twb-menu-changed', onMenuChanged)
  window.removeEventListener('twb-project-changed', onProjectChanged)
  window.removeEventListener('storage', onStorageProject)
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-canvas);
  color: var(--text-main);
}

/* ================= 侧边栏 ================= */
.sidebar {
  width: 220px;
  background: var(--bg-sidebar);
  color: #f1f5f9;
  padding: 16px 0 12px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  border-right: 1px solid var(--bg-sidebar-border);
  z-index: 20;
}

.sidebar.collapsed {
  width: 58px;
}

.logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 16px;
  border-bottom: 1px solid var(--bg-sidebar-border);
  margin-bottom: 8px;
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.logo-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
}

.brand-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.brand-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.collapse-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.sidebar.collapsed .logo-row {
  justify-content: center;
  padding: 0 0 14px;
}

.sidebar.collapsed .label {
  display: none !important;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.group-title {
  padding: 12px 10px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.sidebar.collapsed .group-title {
  padding: 8px 0;
  display: flex;
  justify-content: center;
}

.group-line {
  width: 20px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  border-radius: 7px;
  margin-bottom: 2px;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 9px 0;
}

.item-icon {
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
}

.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item:hover {
  background: var(--bg-sidebar-hover);
  color: #ffffff;
}

.menu-item.router-link-active {
  background: var(--bg-sidebar-active);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.sidebar-foot {
  padding: 10px 14px 4px;
  border-top: 1px solid var(--bg-sidebar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.foot-tag {
  font-size: 11px;
  color: #64748b;
  letter-spacing: 0.02em;
}

/* ================= 主视口 & 顶部栏 ================= */
.main-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  box-shadow: var(--shadow-subtle);
  position: sticky;
  top: 0;
  z-index: 15;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.location-crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.crumb-parent {
  color: var(--text-muted);
}

.crumb-sep {
  color: var(--border-color);
  font-size: 12px;
}

.crumb-current {
  color: var(--text-heading);
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主题选择器 */
.theme-dropdown-wrap {
  position: relative;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-toggle-btn:hover {
  border-color: var(--border-focus);
}

.theme-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.theme-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--accent-light);
  color: var(--accent-primary);
  font-weight: 600;
}

.theme-arrow {
  font-size: 10px;
  color: var(--text-muted);
}

.theme-menu-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 250px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 10px;
  z-index: 50;
  animation: fadeIn 0.12s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.popover-head {
  padding: 4px 6px 8px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.popover-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-heading);
}

.popover-tip {
  font-size: 11px;
  color: var(--text-muted);
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-card-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.12s ease;
  border: 1px solid transparent;
}

.theme-card-option:hover {
  background: var(--bg-card-subtle);
}

.theme-card-option.active {
  background: var(--accent-light);
  border-color: var(--accent-primary);
}

.swatch-bubble {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.check-mark {
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.theme-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.theme-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-opt-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading);
}

.theme-opt-badge {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--border-color);
  color: var(--text-muted);
}

.theme-opt-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

/* 用户状态胶囊 */
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 6px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading);
}

.user-role {
  font-size: 10px;
  color: var(--text-muted);
}

/* 顶部操作按钮 */
.top-action-btn {
  height: 32px;
  padding: 0 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.top-action-btn:hover {
  background: var(--bg-card-subtle);
  border-color: var(--border-focus);
}

.btn-logout {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.25);
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

/* 内容主区域 */
.content {
  flex: 1;
  padding: 20px 24px 36px;
  overflow-x: hidden;
}
</style>
