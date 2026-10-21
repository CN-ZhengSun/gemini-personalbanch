// 全局轻量 Toast 提示（成功/错误/警告/信息），精致胶囊浮窗，自适应主题风格
let container = null

function ensure() {
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText =
      'position:fixed;top:20px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;align-items:flex-end;pointer-events:none;'
    document.body.appendChild(container)
  }
  return container
}

const STYLES = {
  success: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: '✓' },
  error: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✕' },
  warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '!' },
  info: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', icon: 'ℹ' },
}

export function toast(type, msg, duration = 2500) {
  const c = ensure()
  const s = STYLES[type] || STYLES.info
  const el = document.createElement('div')
  el.style.cssText = `background:${s.bg};color:${s.color};padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;align-items:center;gap:10px;border:1px solid ${s.border};max-width:440px;line-height:1.5;transition:all .2s ease;`

  const icon = document.createElement('span')
  icon.style.cssText = `display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${s.color};color:#fff;font-size:11px;font-weight:700;flex-shrink:0;`
  icon.textContent = s.icon

  const text = document.createElement('span')
  text.textContent = msg

  el.appendChild(icon)
  el.appendChild(text)
  c.appendChild(el)

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-6px)'
    setTimeout(() => el.remove(), 250)
  }, duration)
  return el
}

export default {
  success: (m) => toast('success', m),
  error: (m) => toast('error', m),
  warning: (m) => toast('warning', m),
  info: (m) => toast('info', m),
}
