// 全局自定义确认框（Promise-based），替代原生 confirm，自适应 5 种风格主题
let mask = null

function build(message, okText = '确认', cancelText = '取消') {
  mask = document.createElement('div')
  mask.style.cssText =
    'position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;z-index:99998;'

  const box = document.createElement('div')
  box.style.cssText =
    'background:var(--bg-card, #fff);border:1px solid var(--border-color, #e2e8f0);border-radius:12px;padding:22px 24px;width:380px;max-width:90vw;box-shadow:0 12px 36px rgba(0,0,0,.22);font-size:14px;color:var(--text-main, #1f2329);font-family:inherit;'

  const msg = document.createElement('div')
  msg.style.cssText = 'color:var(--text-main, #1f2329);margin-bottom:20px;line-height:1.6;font-size:14px;'
  msg.textContent = message

  const actions = document.createElement('div')
  actions.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;'

  const cancel = document.createElement('button')
  cancel.textContent = cancelText
  cancel.style.cssText =
    'padding:7px 16px;border:1px solid var(--border-color, #d0d7de);background:var(--bg-card-subtle, #f8fafc);color:var(--text-main, #334155);border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s ease;'
  cancel.onmouseover = () => {
    cancel.style.background = 'var(--border-subtle, #e2e8f0)'
  }
  cancel.onmouseout = () => {
    cancel.style.background = 'var(--bg-card-subtle, #f8fafc)'
  }

  const ok = document.createElement('button')
  ok.textContent = okText
  ok.style.cssText =
    'padding:7px 16px;border:none;background:var(--accent-primary, #059669);color:#fff;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s ease;'
  ok.onmouseover = () => {
    ok.style.background = 'var(--accent-hover, #047857)'
  }
  ok.onmouseout = () => {
    ok.style.background = 'var(--accent-primary, #059669)'
  }

  actions.appendChild(cancel)
  actions.appendChild(ok)
  box.appendChild(msg)
  box.appendChild(actions)
  mask.appendChild(box)
  document.body.appendChild(mask)
  return { mask, cancel, ok }
}

export function confirmDialog(message, options = {}) {
  const { okText, cancelText, danger = false } = options
  return new Promise((resolve) => {
    const { mask, cancel, ok } = build(message, okText, cancelText)
    if (danger) {
      ok.style.background = '#dc2626'
      ok.onmouseover = () => (ok.style.background = '#b91c1c')
      ok.onmouseout = () => (ok.style.background = '#dc2626')
    }
    const close = (val) => {
      mask.remove()
      resolve(val)
    }
    cancel.onclick = () => close(false)
    ok.onclick = () => close(true)
    mask.addEventListener('mousedown', (e) => {
      if (e.target === mask) close(false)
    })
  })
}

export default confirmDialog
