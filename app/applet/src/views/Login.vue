<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="brand-badge">
        <span class="brand-icon">🧪</span>
      </div>
      <h2>Personal-Bench</h2>
      <p class="brand-sub">一站式敏捷测试管理平台</p>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>账户用户名</label>
          <input v-model="form.username" placeholder="请输入用户名（默认 admin）" required autocomplete="username" />
        </div>
        <div class="form-group">
          <label>账户密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required autocomplete="current-password" />
        </div>
        <button class="btn login-btn" type="submit" :disabled="loading">
          {{ loading ? '正在登录…' : '登 录 工 作 台' }}
        </button>
      </form>

      <div class="login-tips">
        <span>默认管理员账户: admin / admin123</span>
      </div>

      <p v-if="msg" class="msg-error">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

const router = useRouter()
const form = ref({ username: 'admin', password: '' })
const msg = ref('')
const loading = ref(false)

async function login() {
  msg.value = ''
  loading.value = true
  try {
    const { data } = await authApi.login(form.value)
    localStorage.setItem('twb_authenticated', '1')
    localStorage.setItem('twb_user', JSON.stringify(data.user))
    router.push('/')
  } catch (e) {
    msg.value = e.response?.data?.detail || '登录失败，请检查用户名或密码'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await authApi.me()
    localStorage.setItem('twb_authenticated', '1')
    localStorage.setItem('twb_user', JSON.stringify(data))
    router.replace('/')
  } catch {
    /* 尚未登录 */
  }
})
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 20%, #163a30 0%, #0d2821 50%, #071813 100%);
  padding: 20px;
}

.login-card {
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 40px 36px;
  width: 380px;
  max-width: 100%;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.brand-badge {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.brand-icon {
  font-size: 26px;
  line-height: 1;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0f241c;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}

.brand-sub {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 22px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.form-group input {
  padding: 9px 12px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.15s ease;
}

.form-group input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.15s ease;
}

.login-btn:hover {
  background: #047857;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-tips {
  margin-top: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.msg-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 12px;
  background: #fef2f2;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #fee2e2;
}
</style>
