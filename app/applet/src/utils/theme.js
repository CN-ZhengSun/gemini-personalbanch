// 主题管理模块：提供 5 种精美主题风格切换，默认主版本为「小清新浅绿」
export const THEMES = [
  {
    id: 'fresh-mint',
    name: '小清新浅绿',
    tagline: '清新自然 · 护眼舒缓',
    badge: '主版本',
    primary: '#059669',
    accent: '#10b981',
    bg: '#f4faf6',
    sidebar: '#0d2821',
    swatch: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    icon: '🌿'
  },
  {
    id: 'tech-blue',
    name: '极简科技蓝',
    tagline: '沉稳严谨 · 商务高效',
    badge: '经典',
    primary: '#2563eb',
    accent: '#3b82f6',
    bg: '#f8fafc',
    sidebar: '#0f172a',
    swatch: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    icon: '🔷'
  },
  {
    id: 'warm-amber',
    name: '日系暖杏米',
    tagline: '温润雅致 · 柔和阅读',
    badge: '暖色',
    primary: '#d97706',
    accent: '#f59e0b',
    bg: '#faf7f2',
    sidebar: '#221c19',
    swatch: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    icon: '🍞'
  },
  {
    id: 'lilac-violet',
    name: '优雅丁香紫',
    tagline: '灵感创意 · 摩登精致',
    badge: '典雅',
    primary: '#7c3aed',
    accent: '#8b5cf6',
    bg: '#faf7fd',
    sidebar: '#1d172e',
    swatch: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    icon: '🔮'
  },
  {
    id: 'obsidian-dark',
    name: '深邃暗夜极客',
    tagline: '极客夜巡 · 专注沉浸',
    badge: '暗黑',
    primary: '#10b981',
    accent: '#06b6d4',
    bg: '#0b1120',
    sidebar: '#070b14',
    swatch: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
    icon: '🌙'
  }
]

const STORAGE_KEY = 'twb_theme'

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved
    }
  } catch {
    /* ignore */
  }
  return 'fresh-mint' // 主版本默认
}

export function applyTheme(themeId) {
  const validTheme = THEMES.some(t => t.id === themeId) ? themeId : 'fresh-mint'
  document.documentElement.setAttribute('data-theme', validTheme)
  try {
    localStorage.setItem(STORAGE_KEY, validTheme)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('twb-theme-changed', { detail: validTheme }))
  return validTheme
}
