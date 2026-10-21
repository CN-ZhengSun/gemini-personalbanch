// @ts-nocheck
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Gemini SDK initialization
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
  }
}

// ----------------- Mock Data Definitions with Numeric IDs -----------------
const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_MENU_ROWS = [
  { id: 1, menu_key: null, name: '测试管理', group_key: 'test_manage', is_group: true, sort_order: 10 },
  { id: 2, menu_key: '/workbench', name: '工作台', group_key: 'test_manage', is_group: false, sort_order: 15 },
  { id: 3, menu_key: '/requirements', name: '需求 PRD', group_key: 'test_manage', is_group: false, sort_order: 20 },
  { id: 4, menu_key: '/cases', name: '测试用例', group_key: 'test_manage', is_group: false, sort_order: 30 },
  { id: 5, menu_key: '/plans', name: '测试计划', group_key: 'test_manage', is_group: false, sort_order: 35 },
  { id: 6, menu_key: '/executions', name: '测试执行', group_key: 'test_manage', is_group: false, sort_order: 40 },
  { id: 7, menu_key: '/bugs', name: '缺陷跟踪', group_key: 'test_manage', is_group: false, sort_order: 50 },
  { id: 8, menu_key: '/projects', name: '项目管理', group_key: 'test_manage', is_group: false, sort_order: 60 },
  { id: 9, menu_key: '/report', name: '质量报表', group_key: 'test_manage', is_group: false, sort_order: 70 },
  { id: 10, menu_key: '/automation', name: '自动化脚本', group_key: 'test_manage', is_group: false, sort_order: 80 },
  { id: 11, menu_key: '/releases', name: '版本与环境', group_key: 'test_manage', is_group: false, sort_order: 90 },

  { id: 12, menu_key: null, name: '测试工具', group_key: 'test_tools', is_group: true, sort_order: 100 },
  { id: 13, menu_key: '/apitest', name: '接口测试工具', group_key: 'test_tools', is_group: false, sort_order: 110 },
  { id: 14, menu_key: '/tracking', name: '埋点监控', group_key: 'test_tools', is_group: false, sort_order: 120 },
  { id: 15, menu_key: '/adbtools', name: 'ADB 工具', group_key: 'test_tools', is_group: false, sort_order: 130 },
  { id: 16, menu_key: '/jmeter', name: 'JMeter 工具', group_key: 'test_tools', is_group: false, sort_order: 135 },

  { id: 17, menu_key: null, name: '资产与 AI', group_key: 'assets_ai', is_group: true, sort_order: 140 },
  { id: 18, menu_key: '/knowledge', name: '知识库', group_key: 'assets_ai', is_group: false, sort_order: 150 },
  { id: 19, menu_key: '/skills', name: 'SKILL 管理', group_key: 'assets_ai', is_group: false, sort_order: 160 },
  { id: 20, menu_key: '/ai', name: 'AI 模型配置', group_key: 'assets_ai', is_group: false, sort_order: 170 },
  { id: 21, menu_key: '/menu-manage', name: '菜单管理', group_key: 'assets_ai', is_group: false, sort_order: 180 },
];

let db: any = {
  users: [
    { id: 1, username: 'admin', display_name: '测试管理员', role: 'admin' },
    { id: 2, username: 'tester', display_name: '测试工程师-李华', role: 'tester' }
  ],
  projects: [
    {
      id: 1,
      name: '电商中台系统 (E-Commerce Core)',
      description: '核心交易中台，包括用户中心、购物车、订单结算、在线支付及物流履约模块。',
      owner: 'admin',
      status: 'active',
      deliver_date: '2026-12-30',
      created_at: '2026-09-10 10:00:00',
      updated_at: '2026-10-18 15:20:00'
    },
    {
      id: 2,
      name: '移动客户端 App (iOS & Android)',
      description: '支持千万级用户的移动终端体验，集成商品瀑布流、直播带货与极速结账。',
      owner: 'admin',
      status: 'active',
      deliver_date: '2026-11-20',
      created_at: '2026-09-15 14:30:00',
      updated_at: '2026-10-17 11:10:00'
    },
    {
      id: 3,
      name: '开放支付网关 (PayGateway API)',
      description: '高并发高可靠的聚合支付与对账引擎，对接支付宝、微信支付与国际信用卡渠道。',
      owner: 'admin',
      status: 'active',
      deliver_date: '2026-12-15',
      created_at: '2026-09-20 09:15:00',
      updated_at: '2026-10-15 18:40:00'
    }
  ],
  prds: [
    {
      id: 1,
      project_id: 1,
      title: '统一会员认证与账户安全 PRD v2.1',
      version: 'v2.1',
      content: '定义用户账号注册、手机验证码/密码登录、图形验证码防护、密码找回及双因子认证（2FA）流程规范。',
      created_at: '2026-10-01 09:00:00'
    },
    {
      id: 2,
      project_id: 1,
      title: '购物车与促销优惠券核销 PRD v1.8',
      version: 'v1.8',
      content: '规定满减券、折扣券与平台无门槛券在购物车及结算页的叠加规则与互斥机制。',
      created_at: '2026-10-05 14:00:00'
    }
  ],
  requirements: [
    {
      id: 1,
      project_id: 1,
      prd_id: 1,
      title: '支持密码与短信验证码双登录模式',
      description: '用户可以在账号密码登录与短信快捷验证码登录之间无缝切换，保证 60 秒倒计时防重放。',
      priority: 'P0',
      module: '用户登录',
      status: 'approved',
      created_at: '2026-10-02 10:00:00'
    },
    {
      id: 2,
      project_id: 1,
      prd_id: 1,
      title: '输错密码 5 次锁定账号 15 分钟',
      description: '增强账户防暴力破解机制，连续输错 5 次密码强制触发 IP 锁定与手机短信告警。',
      priority: 'P1',
      module: '用户登录',
      status: 'approved',
      created_at: '2026-10-02 11:30:00'
    },
    {
      id: 3,
      project_id: 1,
      prd_id: 2,
      title: '购物车勾选商品计算实付总金额',
      description: '动态计算运费、店铺减免和优惠券金额，确保精度符合浮点保留 2 位规范。',
      priority: 'P0',
      module: '购物车',
      status: 'approved',
      created_at: '2026-10-06 16:00:00'
    }
  ],
  versions: [
    {
      id: 1,
      project_id: 1,
      name: 'v2.1.0-Release',
      description: '双十一大促首轮预演稳定版，上线登录安全加固与优惠券核销。',
      release_date: '2026-10-25',
      status: 'released',
      created_at: '2026-10-01 10:00:00'
    },
    {
      id: 2,
      project_id: 1,
      name: 'v2.2.0-Alpha',
      description: '集成直播购物车与秒杀防刷风控引擎。',
      release_date: '2026-11-10',
      status: 'planning',
      created_at: '2026-10-15 15:00:00'
    }
  ],
  environments: [
    {
      id: 1,
      name: '测试环境-SIT1',
      base_url: 'https://sit1.api.example.com',
      health_status: 'online',
      description: '敏捷迭代联调主环境，对接模拟支付沙箱与 Redis 集群。',
      created_at: '2026-09-12 11:00:00'
    },
    {
      id: 2,
      name: '准生产环境-Staging',
      base_url: 'https://staging.api.example.com',
      health_status: 'online',
      description: '1:1 对标线上真实配置，全量压测与终验封版环境。',
      created_at: '2026-09-15 16:30:00'
    }
  ],
  plans: [
    {
      id: 1,
      project_id: 1,
      version_id: 1,
      name: '2026秋季大促回归测试计划',
      description: '核心交易闭环全流程回归，覆盖登录鉴权、结算优惠及退款逆向单。',
      start_date: '2026-10-10',
      end_date: '2026-10-22',
      status: 'active',
      created_at: '2026-10-09 10:00:00'
    },
    {
      id: 2,
      project_id: 1,
      version_id: 1,
      name: '安全渗透与反刷单防线回归',
      description: 'SQL注入、越权读取订单、高并发库存超卖探测。',
      start_date: '2026-10-14',
      end_date: '2026-10-20',
      status: 'done',
      created_at: '2026-10-13 14:00:00'
    }
  ],
  cases: [
    {
      id: 1,
      project_id: 1,
      module: '用户登录',
      title: '标准用户名与密码登录成功',
      preconditions: '测试账号 test_admin 已激活，密码 12345678',
      priority: 'P0',
      case_type: 'functional',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      steps: [
        { step_no: 1, action: '在浏览器中打开登录页面', expected: '正常展示登录卡片与输入框' },
        { step_no: 2, action: '在账号输入框键入 test_admin，密码框键入 12345678', expected: '输入内容有效回显或密码密文显示' },
        { step_no: 3, action: '点击“登录”按钮', expected: '接口返回 200，并携带 Token 成功重定向到控制台' }
      ],
      requirement_ids: [1],
      tags: '冒烟测试,P0,登录',
      status: 'active',
      author: '测试工程师-张三',
      created_at: '2026-10-03 10:00:00'
    },
    {
      id: 2,
      project_id: 1,
      module: '用户登录',
      title: '密码错误时友好错误提示与重试计数',
      preconditions: '测试账号已存在',
      priority: 'P1',
      case_type: 'functional',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      steps: [
        { step_no: 1, action: '打开登录页面输入合法用户名和错误密码', expected: '提示“账号或密码不正确，还剩 4 次机会”' }
      ],
      requirement_ids: [2],
      tags: '异常测试,密码重试',
      status: 'active',
      author: '测试工程师-张三',
      created_at: '2026-10-03 11:20:00'
    },
    {
      id: 3,
      project_id: 1,
      module: '购物车',
      title: '满 200 减 30 优惠券结算时正确扣减',
      preconditions: '账户持有“满200-30”可用优惠券一张，商品总价满 240 元',
      priority: 'P0',
      case_type: 'functional',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      steps: [
        { step_no: 1, action: '将商品添加至购物车并前往结算', expected: '结算页自动推荐并选中最高优惠券' },
        { step_no: 2, action: '检查实付总额明细', expected: '显示原价 240，优惠券扣减 30，最终应付 210 元' }
      ],
      requirement_ids: [3],
      tags: '大促核心,优惠券',
      status: 'active',
      author: '测试工程师-李华',
      created_at: '2026-10-07 14:10:00'
    }
  ],
  executions: [
    {
      id: 1,
      plan_id: 1,
      case_id: 1,
      case_title: '标准用户名与密码登录成功',
      module: '用户登录',
      priority: 'P0',
      assignee: 'admin',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      status: 'pass',
      actual_result: '用例通过',
      attachments: '',
      fail_reason: '',
      duration_ms: 1250,
      executed_at: '2026-10-12 11:15:00'
    },
    {
      id: 2,
      plan_id: 1,
      case_id: 2,
      case_title: '密码错误时友好错误提示与重试计数',
      module: '用户登录',
      priority: 'P1',
      assignee: 'admin',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      status: 'pass',
      actual_result: '用例通过',
      attachments: '',
      fail_reason: '',
      duration_ms: 980,
      executed_at: '2026-10-12 11:20:00'
    },
    {
      id: 3,
      plan_id: 1,
      case_id: 3,
      case_title: '满 200 减 30 优惠券结算时正确扣减',
      module: '购物车',
      priority: 'P0',
      assignee: 'admin',
      environment: '测试环境-SIT1',
      version: 'v2.1.0-Release',
      status: 'untested',
      actual_result: '',
      attachments: '',
      fail_reason: '',
      duration_ms: 0,
      executed_at: null
    }
  ],
  bugs: [
    {
      id: 1,
      project_id: 1,
      requirement_id: 1,
      case_id: 2,
      title: '暗黑模式下验证码弹窗透明导致文字不可见',
      description: '在系统暗黑主题下，当触发滑块验证码弹窗时，背景透明度未正确设置，导致滑块文字与背景重叠无法阅读。',
      severity: 'major',
      priority: 'P1',
      status: 'fixing',
      module: '用户登录',
      assignee: 'dev1',
      reporter: 'admin',
      environment: '测试环境-SIT1',
      attachments: '',
      created_at: '2026-10-11 15:30:00',
      updated_at: '2026-10-12 09:40:00'
    },
    {
      id: 2,
      project_id: 1,
      requirement_id: 3,
      case_id: 3,
      title: '多张无门槛优惠券并发点击领取时偶发 500 异常',
      description: '使用压测工具以 50 并发请求秒杀无门槛优惠券，数据库行锁排队超时，导致部分请求返回 500 错误。',
      severity: 'critical',
      priority: 'P0',
      status: 'to_fix',
      module: '购物车',
      assignee: 'dev2',
      reporter: 'admin',
      environment: '测试环境-SIT1',
      attachments: '',
      created_at: '2026-10-13 10:15:00',
      updated_at: '2026-10-13 10:15:00'
    }
  ],
  comments: [
    {
      id: 1,
      bug_id: 1,
      user: 'admin',
      content: '已复现该问题，附带控制台 CSS 样式检查截图。',
      created_at: '2026-10-11 16:00:00'
    },
    {
      id: 2,
      bug_id: 1,
      user: 'dev1',
      content: '定位到问题原因是 Tailwind dark:bg-slate-900 缺失，正在提 PR 修复。',
      created_at: '2026-10-12 09:40:00'
    }
  ],
  scripts: [
    {
      id: 1,
      project_id: 1,
      case_id: 1,
      name: '登录主流程自动化回归 (Playwright)',
      script_type: 'ui',
      framework: 'Playwright',
      version: 'v1.0.0',
      content: `import { test, expect } from '@playwright/test';\n\ntest('standard login test', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('input[placeholder="用户名"]', 'admin');\n  await page.fill('input[placeholder="密码"]', '123456');\n  await page.click('button[type="submit"]');\n  await expect(page).toHaveURL(/.*\\/workbench/);\n});`,
      created_at: '2026-10-08 14:00:00'
    }
  ],
  tasks: [
    {
      id: 1,
      script_id: 1,
      name: '每日凌晨回归调度任务',
      schedule: '0 2 * * *',
      environment: '测试环境-SIT1',
      status: 'active',
      last_run_at: '2026-10-19 02:00:00',
      last_status: 'success',
      created_at: '2026-10-09 11:00:00'
    }
  ],
  knowledge: [
    {
      id: 1,
      project_id: 1,
      category: '规范标准',
      title: '电商支付网关测试与对账验证白皮书',
      content: '本文档梳理了聚合支付网关核心交易链路测试要点：\n1. 渠道路由防单边账校验\n2. 异步回调防重放与验签签名算法\n3. 掉单自动补单与人工退款冲正兜底。',
      tags: '支付,对账,规范',
      author: '测试架构师',
      created_at: '2026-09-25 15:00:00'
    }
  ],
  aiModels: [
    {
      id: 1,
      name: 'Gemini 3.8 Flash (内置推荐)',
      provider: 'google',
      model_name: 'gemini-3.8-flash',
      api_key: 'system-injected',
      base_url: 'https://generativelanguage.googleapis.com',
      is_default: true,
      created_at: '2026-09-01 10:00:00'
    }
  ],
  aiSkills: [
    {
      id: 1,
      name: '需求拆解与测试用例生成',
      description: '深度分析产品需求描述，自动输出正向路径、边界值以及异常防御用例集。',
      input_template: '需求标题：{title}\n需求详情：{content}',
      prompt_template: '请作为资深 QA 工程师，为以下需求设计等价类与边界值用例：\n{input}',
      model_id: 1,
      status: 'enabled',
      created_at: '2026-09-05 10:00:00'
    }
  ],
  aiPrompts: [
    {
      id: 1,
      name: '缺陷根因与日志智能诊断',
      content: '请分析以下测试报错与日志堆栈，指出根本原因并给出修复伪代码：\n{input}',
      variables: 'input',
      created_at: '2026-09-06 10:00:00'
    }
  ],
  apiCases: [
    {
      id: 1,
      project_id: 1,
      name: '会员登录接口 - 正常登录返回 Token',
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      query: [],
      body_type: 'json',
      body: JSON.stringify({ username: 'admin', password: 'password123' }, null, 2),
      assertions: [
        { type: 'status', operator: '==', value: '200' },
        { type: 'json', field: 'token_type', operator: '==', value: 'bearer' }
      ],
      description: '校验会员登录契约与响应状态',
      enabled: true,
      created_at: '2026-10-05 10:00:00'
    }
  ],
  apiEnvs: [
    {
      id: 1,
      project_id: 1,
      name: 'SIT1 联调网关',
      base_url: 'http://localhost:3000',
      variables: { baseUrl: 'http://localhost:3000', token: 'bearer_sit_test' },
      created_at: '2026-10-05 10:00:00'
    }
  ],
  trackingEvents: [
    {
      id: 1,
      project_id: 1,
      event_name: '首页轮播大促商品点击',
      event_key: 'home_banner_click',
      page: 'home_page',
      element_id: 'banner_carousel_item',
      trigger_type: 'click',
      schema_json: JSON.stringify({ banner_id: 'string', goods_id: 'number', rank: 'number' }, null, 2),
      count: 24,
      status: 'normal',
      ignored: false,
      last_triggered_at: '2026-10-18 16:32:10'
    },
    {
      id: 2,
      project_id: 1,
      event_name: '购物车立即结算按钮点击',
      event_key: 'cart_checkout_click',
      page: 'cart_view',
      element_id: 'btn_submit_order',
      trigger_type: 'click',
      schema_json: JSON.stringify({ cart_item_count: 'number', total_price: 'number' }, null, 2),
      count: 58,
      status: 'normal',
      ignored: false,
      last_triggered_at: '2026-10-18 17:15:02'
    }
  ],
  trackingConfig: {
    ws_port: 8080,
    adb_filter_pkg: 'com.example.ecommerce',
    auto_import_schema: true
  },
  adbDevices: [
    {
      serial: 'emulator-5554',
      state: 'device',
      model: 'Pixel 7 Pro (虚拟调试器)',
      brand: 'Google',
      version: '14.0',
      sdk: '34',
      abi: 'arm64-v8a',
      resolution: '1440x3120',
      battery: 92,
      product: 'cheetah',
      device: 'cheetah'
    }
  ],
  menuConfig: [...DEFAULT_MENU_ROWS]
};

// Persistence helpers
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = { ...db, ...parsed };
    // Ensure menuConfig is in row format
    if (!Array.isArray(db.menuConfig) || (db.menuConfig.length && 'items' in db.menuConfig[0])) {
      db.menuConfig = [...DEFAULT_MENU_ROWS];
    }
  } catch (err) {
    console.warn('Failed reading db.json, using defaults:', err);
  }
}

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

// ----------------- API Endpoints -----------------

// 1. Auth API
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username === username) || {
    id: 1,
    username: username || 'admin',
    display_name: '测试管理员',
    role: 'admin'
  };
  res.json({
    access_token: 'twb_token_admin_session',
    token_type: 'bearer',
    user
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json(db.users[0]);
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/v1/auth/change-password', (req, res) => {
  res.json({ ok: true });
});

// 2. Project API
app.get('/api/v1/projects', (req, res) => {
  res.json(db.projects);
});

app.post('/api/v1/projects', (req, res) => {
  const nextId = db.projects.length ? Math.max(...db.projects.map(p => Number(p.id) || 0)) + 1 : 1;
  const newProj = {
    id: nextId,
    name: req.body.name || `新项目-${nextId}`,
    description: req.body.description || '',
    owner: req.body.owner || 'admin',
    status: req.body.status || 'active',
    deliver_date: req.body.deliver_date || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.projects.unshift(newProj);
  saveDb();
  res.status(201).json(newProj);
});

app.get('/api/v1/projects/:id', (req, res) => {
  const p = db.projects.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ detail: '项目不存在' });
  res.json(p);
});

app.patch('/api/v1/projects/:id', (req, res) => {
  const idx = db.projects.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '项目不存在' });
  db.projects[idx] = { ...db.projects[idx], ...req.body, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  saveDb();
  res.json(db.projects[idx]);
});

app.delete('/api/v1/projects/:id', (req, res) => {
  db.projects = db.projects.filter(x => String(x.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 3. PRD API
app.get('/api/v1/prd', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.prds.filter(x => String(x.project_id) === String(pid)) : db.prds;
  res.json(list);
});

app.post('/api/v1/prd', (req, res) => {
  const nextId = db.prds.length ? Math.max(...db.prds.map(p => Number(p.id) || 0)) + 1 : 1;
  const newPrd = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    title: req.body.title || '新需求 PRD',
    version: req.body.version || 'v1.0',
    content: req.body.content || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.prds.unshift(newPrd);
  saveDb();
  res.status(201).json(newPrd);
});

app.get('/api/v1/prd/:id', (req, res) => {
  const p = db.prds.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ detail: 'PRD 不存在' });
  res.json(p);
});

app.delete('/api/v1/prd/:id', (req, res) => {
  db.prds = db.prds.filter(x => String(x.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 4. Requirements API
app.get('/api/v1/requirements', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.requirements.filter(r => String(r.project_id) === String(pid)) : db.requirements;
  res.json(list);
});

app.post('/api/v1/requirements', (req, res) => {
  const nextId = db.requirements.length ? Math.max(...db.requirements.map(r => Number(r.id) || 0)) + 1 : 1;
  const newReq = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    prd_id: req.body.prd_id ? Number(req.body.prd_id) : null,
    title: req.body.title || '新需求',
    description: req.body.description || '',
    priority: req.body.priority || 'P1',
    module: req.body.module || '默认模块',
    status: req.body.status || 'reviewing',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.requirements.unshift(newReq);
  saveDb();
  res.status(201).json(newReq);
});

app.patch('/api/v1/requirements/:id', (req, res) => {
  const idx = db.requirements.findIndex(r => String(r.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '需求不存在' });
  db.requirements[idx] = { ...db.requirements[idx], ...req.body };
  saveDb();
  res.json(db.requirements[idx]);
});

app.delete('/api/v1/requirements/:id', (req, res) => {
  db.requirements = db.requirements.filter(r => String(r.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/requirements/:id/coverage', (req, res) => {
  const reqId = Number(req.params.id);
  const linkedCases = db.cases.filter(c => Array.isArray(c.requirement_ids) && c.requirement_ids.map(Number).includes(reqId));
  const linkedBugs = db.bugs.filter(b => Number(b.requirement_id) === reqId);
  res.json({
    requirement_id: reqId,
    case_count: linkedCases.length,
    bug_count: linkedBugs.length,
    cases: linkedCases
  });
});

// 5. Test Plans API
app.get('/api/v1/plans', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.plans.filter(p => String(p.project_id) === String(pid)) : db.plans;
  res.json(list);
});

app.post('/api/v1/plans', (req, res) => {
  const nextId = db.plans.length ? Math.max(...db.plans.map(p => Number(p.id) || 0)) + 1 : 1;
  const newPlan = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    version_id: req.body.version_id ? Number(req.body.version_id) : null,
    name: req.body.name || '新测试计划',
    description: req.body.description || '',
    start_date: req.body.start_date || new Date().toISOString().substring(0, 10),
    end_date: req.body.end_date || '',
    status: req.body.status || 'draft',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.plans.unshift(newPlan);
  saveDb();
  res.status(201).json(newPlan);
});

app.get('/api/v1/plans/:id', (req, res) => {
  const p = db.plans.find(x => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ detail: '测试计划不存在' });
  res.json(p);
});

app.patch('/api/v1/plans/:id', (req, res) => {
  const idx = db.plans.findIndex(p => String(p.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '测试计划不存在' });
  db.plans[idx] = { ...db.plans[idx], ...req.body };
  saveDb();
  res.json(db.plans[idx]);
});

app.delete('/api/v1/plans/:id', (req, res) => {
  db.plans = db.plans.filter(p => String(p.id) !== String(req.params.id));
  db.executions = db.executions.filter(e => String(e.plan_id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/plans/:id/progress', (req, res) => {
  const planId = Number(req.params.id);
  const execs = db.executions.filter(e => Number(e.plan_id) === planId);
  const total = execs.length;
  const counts = { pass: 0, fail: 0, blocked: 0, skipped: 0, untested: 0 };
  execs.forEach(e => {
    const s = e.status as keyof typeof counts;
    if (counts[s] !== undefined) counts[s]++;
  });
  const passRate = total ? Math.round((counts.pass / total) * 100) : 0;
  res.json({
    plan_id: planId,
    total,
    counts,
    pass_rate: passRate
  });
});

// 6. Test Cases API
app.get('/api/v1/cases', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.cases.filter(c => String(c.project_id) === String(pid)) : db.cases;
  res.json(list);
});

app.post('/api/v1/cases', (req, res) => {
  const nextId = db.cases.length ? Math.max(...db.cases.map(c => Number(c.id) || 0)) + 1 : 1;
  const newCase = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    module: req.body.module || '通用模块',
    title: req.body.title || '新用例',
    preconditions: req.body.preconditions || '',
    priority: req.body.priority || 'P1',
    case_type: req.body.case_type || 'functional',
    environment: req.body.environment || '',
    version: req.body.version || '',
    steps: req.body.steps || [],
    requirement_ids: req.body.requirement_ids || [],
    tags: Array.isArray(req.body.tags) ? req.body.tags.join(',') : (req.body.tags || ''),
    status: req.body.status || 'active',
    author: req.body.author || 'admin',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.cases.unshift(newCase);
  saveDb();
  res.status(201).json(newCase);
});

app.get('/api/v1/cases/template', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cases_template.csv"');
  res.send('所属模块,用例标题,前置条件,优先级,用例类型,用例步骤,预期结果,标签\n用户登录,正确登录成功,已注册账号,P0,功能测试,1. 打开登录页 2. 输入账号密码,登录成功,冒烟\n');
});

app.post('/api/v1/cases/import', (req, res) => {
  res.json({ ok: true, imported: 3, message: '用例导入成功' });
});

app.get('/api/v1/cases/:id', (req, res) => {
  const c = db.cases.find(x => String(x.id) === String(req.params.id));
  if (!c) return res.status(404).json({ detail: '用例不存在' });
  res.json(c);
});

app.patch('/api/v1/cases/:id', (req, res) => {
  const idx = db.cases.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '用例不存在' });
  db.cases[idx] = { ...db.cases[idx], ...req.body };
  saveDb();
  res.json(db.cases[idx]);
});

app.delete('/api/v1/cases/:id', (req, res) => {
  db.cases = db.cases.filter(c => String(c.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 7. Test Executions API
app.get('/api/v1/executions', (req, res) => {
  const { plan_id, case_id } = req.query;
  let list = db.executions;
  if (plan_id) list = list.filter(e => String(e.plan_id) === String(plan_id));
  if (case_id) list = list.filter(e => String(e.case_id) === String(case_id));
  res.json(list);
});

app.post('/api/v1/executions', (req, res) => {
  const nextId = db.executions.length ? Math.max(...db.executions.map(e => Number(e.id) || 0)) + 1 : 1;
  const c = db.cases.find(item => Number(item.id) === Number(req.body.case_id));
  const newExec = {
    id: nextId,
    plan_id: Number(req.body.plan_id) || 1,
    case_id: Number(req.body.case_id),
    case_title: c?.title || req.body.case_title || '测试用例执行',
    module: c?.module || req.body.module || '通用',
    priority: c?.priority || req.body.priority || 'P1',
    assignee: req.body.assignee || 'admin',
    environment: req.body.environment || c?.environment || '测试环境-SIT1',
    version: req.body.version || c?.version || 'v2.1.0-Release',
    status: req.body.status || 'untested',
    actual_result: req.body.actual_result || '',
    attachments: req.body.attachments || '',
    fail_reason: req.body.fail_reason || '',
    duration_ms: req.body.duration_ms || 0,
    executed_at: ['pass', 'fail', 'blocked', 'skipped'].includes(req.body.status)
      ? new Date().toISOString().replace('T', ' ').substring(0, 19)
      : null
  };
  db.executions.unshift(newExec);
  saveDb();
  res.status(201).json(newExec);
});

app.post('/api/v1/executions/batch', (req, res) => {
  const { plan_id, case_ids = [], assignee, environment, version } = req.body;
  const created: any[] = [];
  let currentMax = db.executions.length ? Math.max(...db.executions.map(e => Number(e.id) || 0)) : 0;

  for (const cid of case_ids) {
    currentMax += 1;
    const c = db.cases.find(item => Number(item.id) === Number(cid));
    const rec = {
      id: currentMax,
      plan_id: Number(plan_id) || 1,
      case_id: Number(cid),
      case_title: c?.title || '测试用例',
      module: c?.module || '通用',
      priority: c?.priority || 'P1',
      assignee: assignee || 'admin',
      environment: environment || c?.environment || '测试环境-SIT1',
      version: version || c?.version || 'v2.1.0-Release',
      status: 'untested',
      actual_result: '',
      attachments: '',
      fail_reason: '',
      duration_ms: 0,
      executed_at: null
    };
    db.executions.unshift(rec);
    created.push(rec);
  }
  saveDb();
  res.status(201).json(created);
});

app.patch('/api/v1/executions/:id', (req, res) => {
  const idx = db.executions.findIndex(e => String(e.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '执行记录不存在' });
  const updated = { ...db.executions[idx], ...req.body };
  if (['pass', 'fail', 'blocked', 'skipped'].includes(req.body.status)) {
    updated.executed_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  db.executions[idx] = updated;
  saveDb();
  res.json(db.executions[idx]);
});

app.delete('/api/v1/executions/:id', (req, res) => {
  db.executions = db.executions.filter(e => String(e.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 8. Bugs API
app.get('/api/v1/bugs', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.bugs.filter(b => String(b.project_id) === String(pid)) : db.bugs;
  res.json(list);
});

app.post('/api/v1/bugs', (req, res) => {
  const nextId = db.bugs.length ? Math.max(...db.bugs.map(b => Number(b.id) || 0)) + 1 : 1;
  const newBug = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    requirement_id: req.body.requirement_id ? Number(req.body.requirement_id) : null,
    case_id: req.body.case_id ? Number(req.body.case_id) : null,
    title: req.body.title || '新缺陷',
    description: req.body.description || '',
    severity: req.body.severity || 'major',
    priority: req.body.priority || 'P1',
    status: req.body.status || 'to_fix',
    module: req.body.module || '通用模块',
    assignee: req.body.assignee || 'dev1',
    reporter: req.body.reporter || 'admin',
    environment: req.body.environment || '测试环境-SIT1',
    attachments: req.body.attachments || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.bugs.unshift(newBug);
  saveDb();
  res.status(201).json(newBug);
});

app.get('/api/v1/bugs/:id', (req, res) => {
  const b = db.bugs.find(x => String(x.id) === String(req.params.id));
  if (!b) return res.status(404).json({ detail: '缺陷不存在' });
  res.json(b);
});

app.patch('/api/v1/bugs/:id', (req, res) => {
  const idx = db.bugs.findIndex(b => String(b.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '缺陷不存在' });
  db.bugs[idx] = { ...db.bugs[idx], ...req.body, updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) };
  saveDb();
  res.json(db.bugs[idx]);
});

app.delete('/api/v1/bugs/:id', (req, res) => {
  db.bugs = db.bugs.filter(b => String(b.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/bugs/:id/comments', (req, res) => {
  const bugId = Number(req.params.id);
  const list = db.comments.filter(c => Number(c.bug_id) === bugId);
  res.json(list);
});

app.post('/api/v1/bugs/:id/comments', (req, res) => {
  const bugId = Number(req.params.id);
  const nextId = db.comments.length ? Math.max(...db.comments.map(c => Number(c.id) || 0)) + 1 : 1;
  const newComment = {
    id: nextId,
    bug_id: bugId,
    user: req.body.user || 'admin',
    content: req.body.content || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.comments.push(newComment);
  saveDb();
  res.status(201).json(newComment);
});

// 9. Automation Scripts & Tasks API
app.get('/api/v1/automation/scripts', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.scripts.filter(s => String(s.project_id) === String(pid)) : db.scripts;
  res.json(list);
});

app.post('/api/v1/automation/scripts', (req, res) => {
  const nextId = db.scripts.length ? Math.max(...db.scripts.map(s => Number(s.id) || 0)) + 1 : 1;
  const newScript = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    case_id: req.body.case_id ? Number(req.body.case_id) : null,
    name: req.body.name || '新自动化脚本',
    script_type: req.body.script_type || 'ui',
    framework: req.body.framework || 'Playwright',
    version: req.body.version || 'v1.0.0',
    content: req.body.content || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.scripts.unshift(newScript);
  saveDb();
  res.status(201).json(newScript);
});

app.patch('/api/v1/automation/scripts/:id', (req, res) => {
  const idx = db.scripts.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '脚本不存在' });
  db.scripts[idx] = { ...db.scripts[idx], ...req.body };
  saveDb();
  res.json(db.scripts[idx]);
});

app.delete('/api/v1/automation/scripts/:id', (req, res) => {
  db.scripts = db.scripts.filter(s => String(s.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/automation/tasks', (req, res) => {
  res.json(db.tasks);
});

app.post('/api/v1/automation/tasks', (req, res) => {
  const nextId = db.tasks.length ? Math.max(...db.tasks.map(t => Number(t.id) || 0)) + 1 : 1;
  const newTask = {
    id: nextId,
    script_id: Number(req.body.script_id) || 1,
    name: req.body.name || '新自动化调度任务',
    schedule: req.body.schedule || '0 0 * * *',
    environment: req.body.environment || '测试环境-SIT1',
    status: req.body.status || 'active',
    last_run_at: null,
    last_status: null,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.tasks.unshift(newTask);
  saveDb();
  res.status(201).json(newTask);
});

app.patch('/api/v1/automation/tasks/:id', (req, res) => {
  const idx = db.tasks.findIndex(t => String(t.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '调度任务不存在' });
  db.tasks[idx] = { ...db.tasks[idx], ...req.body };
  saveDb();
  res.json(db.tasks[idx]);
});

app.delete('/api/v1/automation/tasks/:id', (req, res) => {
  db.tasks = db.tasks.filter(t => String(t.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.post('/api/v1/automation/tasks/:id/run', (req, res) => {
  const task = db.tasks.find(t => String(t.id) === String(req.params.id));
  if (task) {
    task.last_run_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    task.last_status = 'success';
    saveDb();
    return res.json({ ok: true, last_run_at: task.last_run_at, status: 'success' });
  }
  res.status(404).json({ detail: '任务不存在' });
});

// 10. Versions & Environments API
app.get('/api/v1/releases/versions', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.versions.filter(v => String(v.project_id) === String(pid)) : db.versions;
  res.json(list);
});

app.post('/api/v1/releases/versions', (req, res) => {
  const nextId = db.versions.length ? Math.max(...db.versions.map(v => Number(v.id) || 0)) + 1 : 1;
  const newVer = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    name: req.body.name || 'v1.0.0',
    description: req.body.description || '',
    release_date: req.body.release_date || new Date().toISOString().substring(0, 10),
    status: req.body.status || 'planning',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.versions.unshift(newVer);
  saveDb();
  res.status(201).json(newVer);
});

app.patch('/api/v1/releases/versions/:id', (req, res) => {
  const idx = db.versions.findIndex(v => String(v.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '版本不存在' });
  db.versions[idx] = { ...db.versions[idx], ...req.body };
  saveDb();
  res.json(db.versions[idx]);
});

app.delete('/api/v1/releases/versions/:id', (req, res) => {
  db.versions = db.versions.filter(v => String(v.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/releases/environments', (req, res) => {
  res.json(db.environments);
});

app.post('/api/v1/releases/environments', (req, res) => {
  const nextId = db.environments.length ? Math.max(...db.environments.map(e => Number(e.id) || 0)) + 1 : 1;
  const newEnv = {
    id: nextId,
    name: req.body.name || '新测试环境',
    base_url: req.body.base_url || 'http://localhost',
    health_status: 'online',
    description: req.body.description || '',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.environments.unshift(newEnv);
  saveDb();
  res.status(201).json(newEnv);
});

app.patch('/api/v1/releases/environments/:id', (req, res) => {
  const idx = db.environments.findIndex(e => String(e.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '环境不存在' });
  db.environments[idx] = { ...db.environments[idx], ...req.body };
  saveDb();
  res.json(db.environments[idx]);
});

app.delete('/api/v1/releases/environments/:id', (req, res) => {
  db.environments = db.environments.filter(e => String(e.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 11. Knowledge API
app.get('/api/v1/knowledge', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.knowledge.filter(k => String(k.project_id) === String(pid)) : db.knowledge;
  res.json(list);
});

app.post('/api/v1/knowledge', (req, res) => {
  const nextId = db.knowledge.length ? Math.max(...db.knowledge.map(k => Number(k.id) || 0)) + 1 : 1;
  const newDoc = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    category: req.body.category || '测试规范',
    title: req.body.title || '新知识库文档',
    content: req.body.content || '',
    tags: req.body.tags || '',
    author: req.body.author || 'admin',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.knowledge.unshift(newDoc);
  saveDb();
  res.status(201).json(newDoc);
});

app.get('/api/v1/knowledge/:id', (req, res) => {
  const k = db.knowledge.find(x => String(x.id) === String(req.params.id));
  if (!k) return res.status(404).json({ detail: '文档不存在' });
  res.json(k);
});

app.patch('/api/v1/knowledge/:id', (req, res) => {
  const idx = db.knowledge.findIndex(k => String(k.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '文档不存在' });
  db.knowledge[idx] = { ...db.knowledge[idx], ...req.body };
  saveDb();
  res.json(db.knowledge[idx]);
});

app.delete('/api/v1/knowledge/:id', (req, res) => {
  db.knowledge = db.knowledge.filter(k => String(k.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 12. Menu Config API (Flat rows for MenuManage.vue & App.vue)
app.get('/api/v1/menu-config', (req, res) => {
  res.json(db.menuConfig);
});

app.put('/api/v1/menu-config', (req, res) => {
  if (Array.isArray(req.body)) {
    db.menuConfig = req.body.map((r, i) => ({
      id: r.id || i + 1,
      menu_key: r.is_group ? null : r.menu_key,
      name: r.name,
      group_key: r.group_key,
      is_group: !!r.is_group,
      sort_order: r.sort_order || (i + 1) * 10
    }));
    saveDb();
    return res.json({ ok: true, count: db.menuConfig.length });
  }
  res.status(400).json({ detail: '非法菜单格式' });
});

// 13. JMeter API
app.post('/api/v1/jmeter/launch', (req, res) => {
  res.json({ ok: true, message: 'JMeter 并发压力测试已在后台启动！' });
});

// 14. AI Models & Skills & Prompts API
app.get('/api/v1/ai/models', (req, res) => {
  res.json(db.aiModels);
});

app.post('/api/v1/ai/models', (req, res) => {
  const nextId = db.aiModels.length ? Math.max(...db.aiModels.map(m => Number(m.id) || 0)) + 1 : 1;
  const newModel = {
    id: nextId,
    name: req.body.name || 'AI 模型',
    provider: req.body.provider || 'google',
    model_name: req.body.model_name || 'gemini-3.8-flash',
    api_key: req.body.api_key || 'sk-configured',
    base_url: req.body.base_url || '',
    is_default: !!req.body.is_default,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.aiModels.push(newModel);
  saveDb();
  res.status(201).json(newModel);
});

app.patch('/api/v1/ai/models/:id', (req, res) => {
  const idx = db.aiModels.findIndex(m => String(m.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '模型配置不存在' });
  db.aiModels[idx] = { ...db.aiModels[idx], ...req.body };
  saveDb();
  res.json(db.aiModels[idx]);
});

app.delete('/api/v1/ai/models/:id', (req, res) => {
  db.aiModels = db.aiModels.filter(m => String(m.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/ai/skills', (req, res) => {
  res.json(db.aiSkills);
});

app.post('/api/v1/ai/skills', (req, res) => {
  const nextId = db.aiSkills.length ? Math.max(...db.aiSkills.map(s => Number(s.id) || 0)) + 1 : 1;
  const newSkill = {
    id: nextId,
    name: req.body.name || '新测试 Skill',
    description: req.body.description || '',
    input_template: req.body.input_template || '',
    prompt_template: req.body.prompt_template || '',
    model_id: Number(req.body.model_id) || 1,
    status: req.body.status || 'enabled',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.aiSkills.push(newSkill);
  saveDb();
  res.status(201).json(newSkill);
});

app.patch('/api/v1/ai/skills/:id', (req, res) => {
  const idx = db.aiSkills.findIndex(s => String(s.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: 'Skill 不存在' });
  db.aiSkills[idx] = { ...db.aiSkills[idx], ...req.body };
  saveDb();
  res.json(db.aiSkills[idx]);
});

app.delete('/api/v1/ai/skills/:id', (req, res) => {
  db.aiSkills = db.aiSkills.filter(s => String(s.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.get('/api/v1/ai/prompts', (req, res) => {
  res.json(db.aiPrompts);
});

app.post('/api/v1/ai/prompts', (req, res) => {
  const nextId = db.aiPrompts.length ? Math.max(...db.aiPrompts.map(p => Number(p.id) || 0)) + 1 : 1;
  const newPrompt = {
    id: nextId,
    name: req.body.name || '新 Prompt 模板',
    content: req.body.content || '',
    variables: req.body.variables || 'input',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.aiPrompts.push(newPrompt);
  saveDb();
  res.status(201).json(newPrompt);
});

app.delete('/api/v1/ai/prompts/:id', (req, res) => {
  db.aiPrompts = db.aiPrompts.filter(p => String(p.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

// 15. Upload API
app.post('/api/v1/upload', (req, res) => {
  res.json({
    url: '/uploads/sample_attachment.png',
    filename: 'sample_attachment.png',
    size: 20480
  });
});

// 16. Dashboard Summary API (Matching both Report.vue and Workbench.vue)
app.get('/api/v1/dashboard/summary', (req, res) => {
  const pid = req.query.project_id ? String(req.query.project_id) : '';
  const mod = req.query.module ? String(req.query.module) : '';

  const fReqs = pid ? db.requirements.filter(r => String(r.project_id) === pid) : db.requirements;
  const fCases = pid ? db.cases.filter(c => String(c.project_id) === pid) : db.cases;
  let fBugs = pid ? db.bugs.filter(b => String(b.project_id) === pid) : db.bugs;

  const caseIds = new Set(fCases.map(c => Number(c.id)));
  const fExecs = pid ? db.executions.filter(e => caseIds.has(Number(e.case_id))) : db.executions;

  const reqTotal = fReqs.length;
  const caseTotal = fCases.length;
  const bugTotal = fBugs.length;

  const execCounts = { pass: 0, fail: 0, blocked: 0, skipped: 0, untested: 0 };
  fExecs.forEach(e => {
    const s = e.status as keyof typeof execCounts;
    if (execCounts[s] !== undefined) execCounts[s]++;
  });
  const execTotal = fExecs.length;
  const executedCnt = execCounts.pass + execCounts.fail + execCounts.blocked + execCounts.skipped;

  const openBugs = fBugs.filter(b => ['to_fix', 'fixing', 'fixed', 'reopen'].includes(b.status)).length;

  // Requirement coverage
  const coveredReqs = fReqs.filter(r => {
    return fCases.some(c => Array.isArray(c.requirement_ids) && c.requirement_ids.map(Number).includes(Number(r.id)));
  }).length;
  const reqCoverage = reqTotal ? Math.round((coveredReqs / reqTotal) * 1000) / 10 : 0;

  // Severity distribution
  const sevDist: Record<string, number> = {};
  const bugsForSev = mod ? fBugs.filter(b => b.module === mod) : fBugs;
  bugsForSev.forEach(b => {
    sevDist[b.severity] = (sevDist[b.severity] || 0) + 1;
  });

  // Bug status distribution
  const statusDist: Record<string, number> = {};
  fBugs.forEach(b => {
    statusDist[b.status] = (statusDist[b.status] || 0) + 1;
  });

  // Bug modules
  const bugModules = Array.from(new Set(fBugs.map(b => b.module).filter(Boolean))).sort();

  res.json({
    requirement_total: reqTotal,
    case_total: caseTotal,
    bug_total: bugTotal,
    open_bugs: openBugs,
    exec_total: execTotal,
    exec_counts: execCounts,
    exec_rate: caseTotal ? Math.round((executedCnt / caseTotal) * 1000) / 10 : 0,
    pass_rate: executedCnt ? Math.round((execCounts.pass / executedCnt) * 1000) / 10 : 0,
    req_coverage: reqCoverage,
    severity_dist: sevDist,
    bug_status_dist: statusDist,
    bug_modules: bugModules
  });
});

// 17. ApiTest API (Cases & Envs & Run)
app.get('/api/v1/apitest/cases', (req, res) => {
  const pid = req.query.project_id;
  const kw = (req.query.keyword as string || '').trim().toLowerCase();
  let list = pid ? db.apiCases.filter(c => String(c.project_id) === String(pid)) : db.apiCases;
  if (kw) {
    list = list.filter(c => c.name.toLowerCase().includes(kw) || c.url.toLowerCase().includes(kw));
  }
  res.json(list);
});

app.post('/api/v1/apitest/cases', (req, res) => {
  const nextId = db.apiCases.length ? Math.max(...db.apiCases.map(c => Number(c.id) || 0)) + 1 : 1;
  const newCase = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    name: req.body.name || '新接口用例',
    method: req.body.method || 'GET',
    url: req.body.url || '/api/v1/health',
    headers: req.body.headers || [],
    query: req.body.query || [],
    body_type: req.body.body_type || 'none',
    body: req.body.body || '',
    assertions: req.body.assertions || [],
    description: req.body.description || '',
    enabled: req.body.enabled !== false,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.apiCases.unshift(newCase);
  saveDb();
  res.status(201).json(newCase);
});

app.put('/api/v1/apitest/cases/:id', (req, res) => {
  const idx = db.apiCases.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '用例不存在' });
  db.apiCases[idx] = { ...db.apiCases[idx], ...req.body };
  saveDb();
  res.json(db.apiCases[idx]);
});

app.delete('/api/v1/apitest/cases/:id', (req, res) => {
  db.apiCases = db.apiCases.filter(c => String(c.id) !== String(req.params.id));
  saveDb();
  res.json({ ok: true });
});

app.get('/api/v1/apitest/envs', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.apiEnvs.filter(e => String(e.project_id) === String(pid)) : db.apiEnvs;
  res.json(list);
});

app.post('/api/v1/apitest/envs', (req, res) => {
  const nextId = db.apiEnvs.length ? Math.max(...db.apiEnvs.map(e => Number(e.id) || 0)) + 1 : 1;
  const newEnv = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    name: req.body.name || '新环境',
    base_url: req.body.base_url || '',
    variables: typeof req.body.variables === 'string' ? JSON.parse(req.body.variables || '{}') : (req.body.variables || {}),
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.apiEnvs.push(newEnv);
  saveDb();
  res.status(201).json(newEnv);
});

app.put('/api/v1/apitest/envs/:id', (req, res) => {
  const idx = db.apiEnvs.findIndex(e => String(e.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '环境不存在' });
  const vars = typeof req.body.variables === 'string' ? JSON.parse(req.body.variables || '{}') : (req.body.variables || db.apiEnvs[idx].variables);
  db.apiEnvs[idx] = { ...db.apiEnvs[idx], ...req.body, variables: vars };
  saveDb();
  res.json(db.apiEnvs[idx]);
});

app.delete('/api/v1/apitest/envs/:id', (req, res) => {
  db.apiEnvs = db.apiEnvs.filter(e => String(e.id) !== String(req.params.id));
  saveDb();
  res.json({ ok: true });
});

app.post('/api/v1/apitest/run', async (req, res) => {
  const payload = req.body || {};
  const caseData = payload.case || {};
  const envData = payload.env || {};
  const variables = typeof envData.variables === 'string' ? JSON.parse(envData.variables || '{}') : (envData.variables || {});

  let url = (caseData.url || '').trim();
  const baseUrl = (envData.base_url || '').replace(/\/$/, '');

  // Variable interpolation {{key}}
  for (const [k, v] of Object.entries(variables)) {
    url = url.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
  }
  if (url && !/^https?:\/\//i.test(url) && baseUrl) {
    url = `${baseUrl}/${url.replace(/^\//, '')}`;
  }
  if (!url) {
    url = 'http://localhost:3000/api/v1/auth/me';
  }

  const method = (caseData.method || 'GET').toUpperCase();
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = { 'User-Agent': 'PersonalBench-Runner/1.0' };
    if (Array.isArray(caseData.headers)) {
      caseData.headers.forEach((h: any) => {
        if (h.enabled && h.key) headers[h.key] = String(h.value || '');
      });
    }

    const fetchOpts: RequestInit = { method, headers };
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && caseData.body) {
      fetchOpts.body = typeof caseData.body === 'string' ? caseData.body : JSON.stringify(caseData.body);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOpts);
    const elapsed = Date.now() - startTime;
    const respHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => { respHeaders[k] = v; });

    const bodyText = await response.text();
    let bodyJson: any = null;
    try { bodyJson = JSON.parse(bodyText); } catch { /* text */ }

    // Run assertions
    const assertionResults: any[] = [];
    if (Array.isArray(caseData.assertions)) {
      caseData.assertions.forEach((a: any) => {
        const type = a.type || 'status';
        const op = a.operator || '==';
        const want = String(a.value || '');
        let actual = '';
        let ok = false;
        if (type === 'status') {
          actual = String(response.status);
          ok = op === '==' ? actual === want : actual !== want;
        } else if (type === 'json') {
          actual = bodyJson && a.field ? String(bodyJson[a.field] ?? '') : '';
          ok = op === '==' ? actual === want : actual.includes(want);
        } else {
          actual = bodyText;
          ok = actual.includes(want);
        }
        assertionResults.push({
          desc: `${a.field || '状态码'} ${op} ${want}`,
          ok,
          actual
        });
      });
    }

    res.json({
      ok: response.status >= 200 && response.status < 400,
      status_code: response.status,
      elapsed_ms: elapsed,
      size_bytes: bodyText.length,
      response_headers: respHeaders,
      response_body: bodyText,
      response_json: bodyJson,
      error: null,
      assertions: assertionResults,
      all_passed: assertionResults.length ? assertionResults.every(x => x.ok) : null
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    res.json({
      ok: false,
      status_code: 500,
      elapsed_ms: elapsed,
      size_bytes: 0,
      response_headers: {},
      response_body: '',
      response_json: null,
      error: err.message,
      assertions: [],
      all_passed: false
    });
  }
});

// 18. Tracking API
app.get('/api/v1/tracking/events', (req, res) => {
  const pid = req.query.project_id;
  const list = pid ? db.trackingEvents.filter(e => String(e.project_id) === String(pid)) : db.trackingEvents;
  res.json(list);
});

app.post('/api/v1/tracking/events', (req, res) => {
  const nextId = db.trackingEvents.length ? Math.max(...db.trackingEvents.map(e => Number(e.id) || 0)) + 1 : 1;
  const newEvt = {
    id: nextId,
    project_id: Number(req.body.project_id) || 1,
    event_name: req.body.event_name || '新埋点',
    event_key: req.body.event_key || `event_${Date.now()}`,
    page: req.body.page || 'home_view',
    element_id: req.body.element_id || 'el_btn',
    trigger_type: req.body.trigger_type || 'click',
    schema_json: req.body.schema_json || '{}',
    count: 0,
    status: 'normal',
    ignored: false,
    last_triggered_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.trackingEvents.unshift(newEvt);
  saveDb();
  res.status(201).json(newEvt);
});

app.patch('/api/v1/tracking/events/:id', (req, res) => {
  const idx = db.trackingEvents.findIndex(e => String(e.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ detail: '埋点不存在' });
  db.trackingEvents[idx] = { ...db.trackingEvents[idx], ...req.body };
  saveDb();
  res.json(db.trackingEvents[idx]);
});

app.delete('/api/v1/tracking/events/:id', (req, res) => {
  db.trackingEvents = db.trackingEvents.filter(e => String(e.id) !== String(req.params.id));
  saveDb();
  res.status(204).send();
});

app.post('/api/v1/tracking/events/ignore', (req, res) => {
  const { ids = [], ignored = true } = req.body;
  const idSet = new Set(ids.map(Number));
  db.trackingEvents.forEach(e => {
    if (idSet.has(Number(e.id))) e.ignored = !!ignored;
  });
  saveDb();
  res.json({ ok: true });
});

app.delete('/api/v1/tracking/events', (req, res) => {
  const pid = req.query.project_id;
  if (pid) {
    db.trackingEvents = db.trackingEvents.filter(e => String(e.project_id) !== String(pid));
  } else {
    db.trackingEvents = [];
  }
  saveDb();
  res.status(204).send();
});

app.post('/api/v1/tracking/events/reset', (req, res) => {
  const pid = req.query.project_id;
  db.trackingEvents.forEach(e => {
    if (!pid || String(e.project_id) === String(pid)) e.count = 0;
  });
  saveDb();
  res.json({ ok: true });
});

app.get('/api/v1/tracking/template', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tracking_template.csv"');
  res.send('页面,元素,事件名,标识Key,触发类型,数据结构JSON\n首页,轮播图,点击轮播,home_banner_click,click,"{""banner_id"":""str""}"\n');
});

app.get('/api/v1/tracking/export', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="tracking_events.csv"');
  let csv = 'ID,页面,元素,事件名,标识Key,触发类型,上报次数,状态\n';
  db.trackingEvents.forEach(e => {
    csv += `${e.id},${e.page},${e.element_id},${e.event_name},${e.event_key},${e.trigger_type},${e.count},${e.status}\n`;
  });
  res.send(csv);
});

app.post('/api/v1/tracking/import', (req, res) => {
  res.json({ ok: true, imported: 5, message: '埋点数据批量导入成功' });
});

app.get('/api/v1/tracking/config', (req, res) => {
  res.json(db.trackingConfig);
});

app.put('/api/v1/tracking/config', (req, res) => {
  db.trackingConfig = { ...db.trackingConfig, ...req.body };
  saveDb();
  res.json(db.trackingConfig);
});

app.get('/api/v1/tracking/status', (req, res) => {
  res.json({ running: false, project_id: req.query.project_id || 1 });
});

app.get('/api/v1/tracking/adb/devices', (req, res) => {
  res.json({ adb_installed: true, devices: db.adbDevices });
});

app.post('/api/v1/tracking/start', (req, res) => {
  res.json({ ok: true, message: '埋点监控已在设备启动捕获' });
});

app.post('/api/v1/tracking/stop', (req, res) => {
  res.json({ ok: true, message: '埋点监控已停止' });
});

app.post('/api/v1/tracking/simulate', (req, res) => {
  const { eid } = req.query;
  const event = db.trackingEvents.find(e => String(e.id) === String(eid) || e.event_key === String(eid));
  if (event) {
    event.count += 1;
    event.last_triggered_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    saveDb();
    return res.json({ ok: true, event_key: event.event_key, count: event.count });
  }
  res.status(404).json({ detail: '未找到对应埋点' });
});

// 19. ADB Tools API
app.get('/api/v1/adb/devices', (req, res) => {
  res.json({
    adb_installed: true,
    devices: db.adbDevices
  });
});

app.post('/api/v1/adb/connect', (req, res) => {
  const host = req.query.host || req.body?.host || '192.168.1.100';
  const port = req.query.port || req.body?.port || 5555;
  const serial = `${host}:${port}`;
  const existing = db.adbDevices.find(d => d.serial === serial);
  if (!existing) {
    db.adbDevices.push({
      serial,
      state: 'device',
      model: 'Android Wireless Phone',
      brand: 'Android',
      version: '14.0',
      sdk: '34',
      abi: 'arm64-v8a',
      resolution: '1080x2400',
      battery: 88,
      product: 'wireless_dev',
      device: 'wireless_dev'
    });
    saveDb();
  }
  res.json({ ok: true, output: `connected to ${serial}` });
});

app.post('/api/v1/adb/disconnect', (req, res) => {
  res.json({ ok: true, output: 'disconnected' });
});

app.get('/api/v1/adb/devices/:serial/info', (req, res) => {
  const d = db.adbDevices.find(x => x.serial === req.params.serial) || db.adbDevices[0];
  res.json({
    serial: req.params.serial,
    model: d?.model || 'Pixel 7 Pro',
    brand: d?.brand || 'Google',
    version: d?.version || '14.0',
    sdk: d?.sdk || '34',
    abi: d?.abi || 'arm64-v8a',
    resolution: d?.resolution || '1440x3120'
  });
});

app.get('/api/v1/adb/devices/:serial/activity', (req, res) => {
  res.json({ activity: 'com.example.ecommerce/.MainActivity' });
});

app.get('/api/v1/adb/devices/:serial/apps', (req, res) => {
  res.json({
    packages: [
      'com.example.ecommerce',
      'com.example.paygateway',
      'com.android.chrome',
      'com.android.settings',
      'com.google.android.gms'
    ]
  });
});

app.get('/api/v1/adb/devices/:serial/screencap', (req, res) => {
  // Return an elegant mock Android device screen SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
    <rect width="360" height="640" fill="#0f172a"/>
    <rect x="0" y="0" width="360" height="28" fill="#1e293b"/>
    <text x="16" y="20" fill="#94a3b8" font-size="12" font-family="sans-serif">10:00</text>
    <text x="310" y="20" fill="#94a3b8" font-size="12" font-family="sans-serif">100%</text>
    <rect x="20" y="50" width="320" height="80" rx="12" fill="#1e293b"/>
    <text x="40" y="90" fill="#38bdf8" font-size="16" font-family="sans-serif" font-weight="bold">Personal-Bench 测试运行中</text>
    <text x="40" y="112" fill="#94a3b8" font-size="12" font-family="sans-serif">当前前台: com.example.ecommerce</text>
    <rect x="20" y="150" width="320" height="200" rx="12" fill="#334155"/>
    <text x="40" y="250" fill="#f8fafc" font-size="14" font-family="sans-serif">ADB 投屏连接稳定 (60 FPS)</text>
    <rect x="20" y="370" width="320" height="230" rx="12" fill="#1e293b"/>
    <text x="40" y="410" fill="#22c55e" font-size="13" font-family="sans-serif">● 自动化测试探针在线</text>
    <text x="40" y="440" fill="#94a3b8" font-size="12" font-family="sans-serif">Logcat 监听中 | 埋点上报正常</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.post('/api/v1/adb/devices/:serial/install', (req, res) => {
  res.json({ ok: true, output: 'Success' });
});

app.post('/api/v1/adb/devices/:serial/uninstall', (req, res) => {
  res.json({ ok: true, output: 'Success' });
});

app.post('/api/v1/adb/devices/:serial/clear', (req, res) => {
  res.json({ ok: true, output: 'Success' });
});

app.post('/api/v1/adb/devices/:serial/launch', (req, res) => {
  const pkg = req.query.package || 'com.example.ecommerce';
  res.json({ ok: true, output: `Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=${pkg}/.MainActivity }` });
});

app.post('/api/v1/adb/devices/:serial/shell', (req, res) => {
  const cmd = (req.body?.cmd || req.body?.command || '').trim();
  res.json({ ok: true, output: `[adb shell] $ ${cmd}\nCommand executed successfully with exit code 0.` });
});

app.post('/api/v1/adb/devices/:serial/execute', (req, res) => {
  const cmd = (req.body?.command || '').trim();
  res.json({ ok: true, output: `[adb execute] $ ${cmd}\nExecution finished (code 0).` });
});

app.post('/api/v1/adb/devices/:serial/reboot', (req, res) => {
  res.json({ ok: true, output: 'Reboot signal dispatched' });
});

app.post('/api/v1/adb/devices/:serial/shutdown', (req, res) => {
  res.json({ ok: true, output: 'Power off signal dispatched' });
});

app.post('/api/v1/adb/devices/:serial/record', (req, res) => {
  res.json({ ok: true, url: '/uploads/screenrecord_sample.mp4' });
});

app.post('/api/v1/adb/devices/:serial/record/start', (req, res) => {
  res.json({ ok: true, message: '录屏已开始' });
});

app.post('/api/v1/adb/devices/:serial/record/stop', (req, res) => {
  res.json({ ok: true, url: '/uploads/screenrecord_sample.mp4' });
});

app.get('/api/v1/adb/devices/:serial/logcat/dump', (req, res) => {
  const lines = Number(req.query.lines) || 100;
  const sampleLog = `10-19 18:00:00.102 1204 1204 I ActivityManager: Displayed com.example.ecommerce/.MainActivity: +412ms\n10-19 18:00:01.450 1204 1250 D ECommerce: Request GET /api/v1/goods/list HTTP/2 200 OK (112ms)\n10-19 18:00:03.890 1204 1204 I PersonalBench: Tracking event [home_banner_click] dispatched.\n10-19 18:00:05.120 1204 1290 W OpenGLRenderer: Bitmap too large to upload into texture\n10-19 18:00:08.300 1204 1204 I ViewRootImpl: Resizing window with insets...`;
  res.json({ ok: true, output: sampleLog });
});

app.post('/api/v1/adb/devices/:serial/logcat/clear', (req, res) => {
  res.json({ ok: true, output: '' });
});

app.post('/api/v1/adb/devices/:serial/apk/package-name', (req, res) => {
  res.json({ packageName: 'com.example.ecommerce', tool: 'mock-aapt2' });
});

app.get('/api/v1/adb/devices/:serial/fs', (req, res) => {
  const p = (req.query.path as string) || '/sdcard';
  res.json({
    path: p,
    entries: [
      { name: 'Download', type: 'dir', size: 4096, mtime: '2026-10-19 10:00:00' },
      { name: 'DCIM', type: 'dir', size: 4096, mtime: '2026-10-19 10:00:00' },
      { name: 'Android', type: 'dir', size: 4096, mtime: '2026-10-19 10:00:00' },
      { name: 'app_log.txt', type: 'file', size: 10240, mtime: '2026-10-19 18:00:00' }
    ]
  });
});

app.post('/api/v1/adb/devices/:serial/fs/pull', (req, res) => {
  res.json({ ok: true, url: '/uploads/pulled_device_file.txt' });
});

app.post('/api/v1/adb/devices/:serial/fs/push', (req, res) => {
  res.json({ ok: true, message: '文件推送成功' });
});

app.get('/api/v1/adb/devices/:serial/monkey/status', (req, res) => {
  res.json({ running: false, pids: [] });
});

app.post('/api/v1/adb/devices/:serial/monkey', (req, res) => {
  res.json({ ok: true, report_name: 'monkey_20261019_180000.txt' });
});

app.post('/api/v1/adb/devices/:serial/monkey/stop', (req, res) => {
  res.json({ ok: true, stopped: true, pids: [] });
});

app.get('/api/v1/adb/devices/:serial/monkey/reports', (req, res) => {
  res.json({
    reports: [
      {
        name: 'monkey_20261018_120000.txt',
        size: 15420,
        created_at: '2026-10-18 12:00:00',
        crashed: false
      }
    ],
    directory: '/tmp/monkey_reports'
  });
});

app.delete('/api/v1/adb/devices/:serial/monkey/reports/:name', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/v1/adb/devices/:serial/notify/jobs', (req, res) => {
  res.json({ jobs: [1001, 1002, 1005] });
});

app.post('/api/v1/adb/devices/:serial/notify/trigger', (req, res) => {
  res.json({ ok: true, steps: ['Job triggered successfully', 'Notification broadcast dispatched'] });
});

app.get('/api/v1/adb/log-analyze/models', (req, res) => {
  res.json(db.aiModels);
});

app.post('/api/v1/adb/devices/:serial/log-analyze', async (req, res) => {
  const lines = req.body?.lines || [];
  if (aiClient && lines.length) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `分析以下 Android Logcat 日志中的异常、崩溃与关键事件，给出清晰根因与解决排查建议：\n${lines.slice(0, 40).join('\n')}`
      });
      return res.json({ ok: true, analysis: response.text });
    } catch { /* fallback */ }
  }
  res.json({
    ok: true,
    analysis: '【Logcat 智能诊断报告】\n1. 检查日志流中暂无 Fatal Crash 信号；\n2. 发现少量渲染重绘与 Bitmap 贴图偏大警告，建议检查图片降采样；\n3. 埋点上报及 Activity 生命周期流转符合预期。'
  });
});

app.get('/api/v1/adb/settings', (req, res) => {
  res.json({ save_dir: 'default' });
});

app.post('/api/v1/adb/settings', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/v1/adb/browse', (req, res) => {
  res.json({ files: [] });
});

// ----------------- Vite Dev / Static Production -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Personal-Bench Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
