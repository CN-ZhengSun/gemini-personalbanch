import {
  Project,
  PRD,
  Requirement,
  TestCase,
  TestPlan,
  TestExecution,
  Bug,
  AutomationScript,
  AutomationTask,
  ReleaseVersion,
  TestEnvironment,
  KnowledgeDoc,
  AiModel,
  AiSkill,
  AiPromptTemplate,
  TrackingEvent,
  AdbDevice,
} from '../types/index.ts';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: '电商中台系统 (E-Commerce Core)',
    description: '核心电商交易中台，包括用户中心、购物车、订单结算、在线支付及物流履约模块。',
    owner: 'admin',
    status: 'active',
    created_at: '2026-09-10 10:00:00',
  },
  {
    id: 'proj-002',
    name: '移动客户端 App (iOS & Android)',
    description: '支持千万级用户的移动终端体验，集成商品瀑布流、直播带货与极速结账。',
    owner: 'admin',
    status: 'active',
    created_at: '2026-09-15 14:30:00',
  },
  {
    id: 'proj-003',
    name: '开放支付网关 (PayGateway API)',
    description: '高并发高可靠的聚合支付与对账引擎，对接支付宝、微信支付与国际信用卡渠道。',
    owner: 'admin',
    status: 'active',
    created_at: '2026-09-20 09:15:00',
  },
];

export const INITIAL_PRDS: PRD[] = [
  {
    id: 'prd-001',
    project_id: 'proj-001',
    title: '用户身份与权限安全体系 PRD',
    version: 'v2.1',
    author: '王产品',
    status: 'approved',
    content: `## 1. 背景与目标
为了提升用户登录体验与账号安全等级，本次迭代全面支持账号密码登录、短信验证码快速登录、扫码授权以及异常异地登录风控拦截。

## 2. 核心功能点
1. 账号密码登录：错误达到5次锁定15分钟；支持图形验证码防御。
2. 手机验证码登录：60秒倒计时冷却，验证码有效期5分钟。
3. 退出与会话管理：支持主动退出、顶号通知、Token过期自动无感刷新。`,
    created_at: '2026-10-01 11:00:00',
  },
  {
    id: 'prd-002',
    project_id: 'proj-001',
    title: '优惠券与多级满减结算引擎 PRD',
    version: 'v1.4',
    author: '李产品',
    status: 'published',
    content: `## 1. 业务目标
支持平台券、店铺券、品类券与跨店满减叠加计算，结算页面实时响应最佳优惠组合方案。

## 2. 约束边界
- 订单实付金额不能低于 0.01 元。
- 退款逆向流程需按优惠分摊比例退还至用户资金原路。`,
    created_at: '2026-10-05 16:20:00',
  },
];

export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-001',
    project_id: 'proj-001',
    prd_id: 'prd-001',
    title: '正确账号密码登录成功与会话保持',
    description: '合法用户输入注册手机号与密码，校验通过后颁发 JWT Token，跳转进入用户控制台。',
    priority: 'P0',
    module: '用户登录',
    status: 'approved',
    case_count: 2,
    created_at: '2026-10-02 09:30:00',
  },
  {
    id: 'req-002',
    project_id: 'proj-001',
    prd_id: 'prd-001',
    title: '连续输错密码安全锁定与防暴力破解',
    description: '连续输错密码达到 5 次后，账号冻结 15 分钟，并弹出安全验证滑块。',
    priority: 'P1',
    module: '用户登录',
    status: 'testing',
    case_count: 2,
    created_at: '2026-10-02 10:15:00',
  },
  {
    id: 'req-003',
    project_id: 'proj-001',
    prd_id: 'prd-002',
    title: '跨店满减优惠金额自动分摊计算',
    description: '根据每个商品占总价的有效权重比例，精确到分位均摊满减抵扣金额。',
    priority: 'P0',
    module: '购物车结算',
    status: 'developing',
    case_count: 1,
    created_at: '2026-10-06 14:00:00',
  },
  {
    id: 'req-004',
    project_id: 'proj-001',
    prd_id: 'prd-002',
    title: '优惠券过期与库存扣减并发控制',
    description: '大促瞬时并发抢券，需利用分布式锁防超发，并保证过期券在订单确认页置灰不可选。',
    priority: 'P1',
    module: '营销中心',
    status: 'reviewing',
    case_count: 0,
    created_at: '2026-10-07 15:30:00',
  },
];

export const INITIAL_CASES: TestCase[] = [
  {
    id: 'TC-001',
    project_id: 'proj-001',
    module: '用户登录',
    title: '标准用户名与密码登录成功',
    preconditions: '测试账号 test_admin 已激活，密码 12345678',
    priority: 'P0',
    case_type: 'functional',
    steps: [
      { step_no: 1, action: '在浏览器中打开登录页面', expected: '正常展示登录卡片与输入框' },
      { step_no: 2, action: '在账号输入框键入 test_admin，密码框键入 12345678', expected: '输入内容有效回显或密码密文显示' },
      { step_no: 3, action: '点击“登录”按钮', expected: '接口返回 200，并携带 Token 成功重定向到控制台' },
    ],
    requirement_ids: ['req-001'],
    tags: ['冒烟测试', 'P0', '登录'],
    status: 'active',
    author: '测试工程师-张三',
    created_at: '2026-10-03 10:00:00',
  },
  {
    id: 'TC-002',
    project_id: 'proj-001',
    module: '用户登录',
    title: '密码错误时友好错误提示与重试计数',
    preconditions: '测试账号已存在',
    priority: 'P1',
    case_type: 'functional',
    steps: [
      { step_no: 1, action: '输入正确的用户名及错误的密码 88888888', expected: '前端表单通过' },
      { step_no: 2, action: '点击登录按钮', expected: '接口返回 401，界面提示“密码错误，剩余尝试次数：4次”' },
    ],
    requirement_ids: ['req-001'],
    tags: ['异常场景', '安全校验'],
    status: 'active',
    author: '测试工程师-张三',
    created_at: '2026-10-03 11:20:00',
  },
  {
    id: 'TC-003',
    project_id: 'proj-001',
    module: '用户登录',
    title: '密码连续错误5次触发账号临时锁定',
    preconditions: '测试账号正常状态',
    priority: 'P1',
    case_type: 'security',
    steps: [
      { step_no: 1, action: '连续输入 5 次错误密码并提交', expected: '第 5 次提交后接口响应 429 锁定状态' },
      { step_no: 2, action: '第 6 次尝试输入正确密码提交', expected: '系统提示“账号已被锁定，请 15 分钟后再试”，阻断请求' },
    ],
    requirement_ids: ['req-002'],
    tags: ['安全测试', '暴力破解防御'],
    status: 'active',
    author: '测试工程师-李四',
    created_at: '2026-10-04 14:00:00',
  },
  {
    id: 'TC-004',
    project_id: 'proj-001',
    module: '购物车结算',
    title: '跨店满300减50优惠自动均摊计算',
    preconditions: '店铺A商品100元，店铺B商品200元，符合跨店满300减50门槛',
    priority: 'P0',
    case_type: 'functional',
    steps: [
      { step_no: 1, action: '将商品 A (100元) 和商品 B (200元) 加入购物车并勾选', expected: '购物车显示满减提示“已满300元，立减50元”' },
      { step_no: 2, action: '点击前往结算页面', expected: '应付金额为 250 元，商品 A 优惠 16.67 元，商品 B 优惠 33.33 元' },
    ],
    requirement_ids: ['req-003'],
    tags: ['结算核心', '金额计算'],
    status: 'active',
    author: '测试工程师-王五',
    created_at: '2026-10-08 09:30:00',
  },
  {
    id: 'TC-005',
    project_id: 'proj-001',
    module: '用户登录',
    title: '用户登录 API 契约与高频限流压测',
    preconditions: 'JMeter 或接口测试工具准备就绪',
    priority: 'P2',
    case_type: 'performance',
    steps: [
      { step_no: 1, action: 'POST /api/v1/auth/login 发送标准载荷', expected: '响应格式符合 OpenAPI 规范，耗时 < 120ms' },
      { step_no: 2, action: '以 500 QPS 持续发送登录探测请求', expected: '网关限流机制生效，未发生内存泄漏或 502 错误' },
    ],
    requirement_ids: ['req-001'],
    tags: ['性能测试', '接口契约'],
    status: 'active',
    author: '测试工程师-赵六',
    created_at: '2026-10-09 16:00:00',
  },
];

export const INITIAL_PLANS: TestPlan[] = [
  {
    id: 'plan-001',
    project_id: 'proj-001',
    version_id: 'ver-001',
    name: 'v2.1.0 登录安全专项回归计划',
    description: '涵盖账号密码、验证码风控锁定及接口性能的全量验收。',
    start_date: '2026-10-10',
    end_date: '2026-10-18',
    status: 'in_progress',
    case_ids: ['TC-001', 'TC-002', 'TC-003', 'TC-005'],
    total_cases: 4,
    passed_cases: 3,
    pass_rate: 75,
    created_at: '2026-10-10 09:00:00',
  },
  {
    id: 'plan-002',
    project_id: 'proj-001',
    version_id: 'ver-002',
    name: '双十一结算与营销优惠冒烟计划',
    description: '重点回归跨店满减与优惠券抵扣结算主流程。',
    start_date: '2026-10-15',
    end_date: '2026-10-25',
    status: 'draft',
    case_ids: ['TC-004'],
    total_cases: 1,
    passed_cases: 0,
    pass_rate: 0,
    created_at: '2026-10-15 14:00:00',
  },
];

export const INITIAL_EXECUTIONS: TestExecution[] = [
  {
    id: 'exec-001',
    plan_id: 'plan-001',
    case_id: 'TC-001',
    case_title: '标准用户名与密码登录成功',
    module: '用户登录',
    priority: 'P0',
    assignee: '测试工程师-张三',
    environment: '测试环境-SIT1',
    status: 'pass',
    actual_result: '测试通过，Token 正常下发，重定向时间 180ms。',
    duration_ms: 1250,
    executed_at: '2026-10-12 11:15:00',
  },
  {
    id: 'exec-002',
    plan_id: 'plan-001',
    case_id: 'TC-002',
    case_title: '密码错误时友好错误提示与重试计数',
    module: '用户登录',
    priority: 'P1',
    assignee: '测试工程师-张三',
    environment: '测试环境-SIT1',
    status: 'pass',
    actual_result: '错误提示明确，剩余次数计算准确。',
    duration_ms: 840,
    executed_at: '2026-10-12 11:30:00',
  },
  {
    id: 'exec-003',
    plan_id: 'plan-001',
    case_id: 'TC-003',
    case_title: '密码连续错误5次触发账号临时锁定',
    module: '用户登录',
    priority: 'P1',
    assignee: '测试工程师-李四',
    environment: '测试环境-SIT1',
    status: 'fail',
    fail_reason: '第5次输错后后端返回 500 Internal Server Error，未返回标准的 429 锁定错误码。',
    actual_result: '后端 Redis 缓存键序列化异常，导致 NullPointerException 并直接抛出 500。',
    duration_ms: 2100,
    executed_at: '2026-10-12 14:20:00',
    bug_id: 'BUG-001',
  },
  {
    id: 'exec-004',
    plan_id: 'plan-001',
    case_id: 'TC-005',
    case_title: '用户登录 API 契约与高频限流压测',
    module: '用户登录',
    priority: 'P2',
    assignee: '测试工程师-赵六',
    environment: '性能基准环境-Perf01',
    status: 'pass',
    actual_result: '限流阈值 500 QPS 拦截正常，P99 响应耗时为 96ms。',
    duration_ms: 5400,
    executed_at: '2026-10-13 16:45:00',
  },
];

export const INITIAL_BUGS: Bug[] = [
  {
    id: 'BUG-001',
    project_id: 'proj-001',
    requirement_id: 'req-002',
    case_id: 'TC-003',
    execution_id: 'exec-003',
    title: '账号连续输错密码触发锁定时接口抛出 500 异常',
    description: '在执行 TC-003 密码连续错误5次测试时，触发锁定时 Redis 连接处理缺少判空逻辑，导致用户看到 500 错误页面。',
    severity: 'major',
    priority: 'P1',
    status: 'fixing',
    assignee: '后端开发-张工',
    reporter: '测试工程师-李四',
    environment: '测试环境-SIT1',
    version: 'v2.1.0-RC1',
    steps_to_reproduce: '1. 进入登录页输入已有账号\n2. 连续输入 5 次错误密码并提交\n3. 观察第 5 次与第 6 次提交的网络响应',
    expected_result: '第 5 次后返回 HTTP 429，附带 JSON: {"code": "ACCOUNT_LOCKED", "retry_after": 900}',
    actual_result: 'HTTP 500 Internal Server Error: RedisCommandExecutionException: ERR key not found',
    created_at: '2026-10-12 14:35:00',
    comments: [
      {
        id: 'comm-001',
        bug_id: 'BUG-001',
        user: '测试工程师-李四',
        content: '已抓取错误日志，定位在 LoginLimitFilter.java:88 行。',
        created_at: '2026-10-12 14:40:00',
      },
      {
        id: 'comm-002',
        bug_id: 'BUG-001',
        user: '后端开发-张工',
        content: '已复现，已向 dev 分支提交 hotfix commit c2a19f，等待合并部署。',
        created_at: '2026-10-12 16:10:00',
      },
    ],
  },
  {
    id: 'BUG-002',
    project_id: 'proj-001',
    requirement_id: 'req-003',
    case_id: 'TC-004',
    title: '跨店满减出现 0.01 元除不尽精度舍入偏差',
    description: '结算商品价格为 100 与 200 时，四舍五入导致两商品均摊总和比实际减免优惠多出 1 分钱。',
    severity: 'minor',
    priority: 'P2',
    status: 'new',
    assignee: '后端开发-刘工',
    reporter: '测试工程师-王五',
    environment: '测试环境-SIT1',
    version: 'v2.1.0-RC1',
    steps_to_reproduce: '构造价格 100.00 和 200.00 的两笔商品加入跨店满减',
    expected_result: '分摊总金额必须与券面优惠 50.00 元精确一致，最后一项做差额吸收。',
    actual_result: '分摊结果为 16.67 + 33.34 = 50.01 元。',
    created_at: '2026-10-14 10:20:00',
    comments: [],
  },
];

export const INITIAL_SCRIPTS: AutomationScript[] = [
  {
    id: 'script-001',
    project_id: 'proj-001',
    case_id: 'TC-001',
    name: 'web_login_flow.spec.ts',
    script_type: 'ui',
    framework: 'playwright',
    version: 'v1.2',
    last_status: 'success',
    last_run_at: '2026-10-18 03:00:00',
    content: `import { test, expect } from '@playwright/test';

test.describe('E-Commerce Login Suite', () => {
  test('User can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test_admin');
    await page.fill('input[name="password"]', '12345678');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('.user-avatar')).toBeVisible();
  });
});`,
  },
  {
    id: 'script-002',
    project_id: 'proj-001',
    case_id: 'TC-005',
    name: 'test_auth_api.py',
    script_type: 'api',
    framework: 'pytest',
    version: 'v2.0',
    last_status: 'success',
    last_run_at: '2026-10-18 04:30:00',
    content: `import pytest
import requests

BASE_URL = "http://test-env.internal/api/v1"

def test_login_success():
    payload = {"username": "test_admin", "password": "correct_password"}
    resp = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"`,
  },
];

export const INITIAL_TASKS: AutomationTask[] = [
  {
    id: 'task-001',
    script_id: 'script-001',
    name: 'Playwright 每夜端到端冒烟回归',
    schedule: '0 3 * * *',
    environment: '测试环境-SIT1',
    last_run_at: '2026-10-18 03:00:00',
    status: 'active',
  },
  {
    id: 'task-002',
    script_id: 'script-002',
    name: 'API 接口契约每两小时巡检',
    schedule: '0 */2 * * *',
    environment: '预发环境-Staging',
    last_run_at: '2026-10-18 04:00:00',
    status: 'active',
  },
];

export const INITIAL_VERSIONS: ReleaseVersion[] = [
  {
    id: 'ver-001',
    project_id: 'proj-001',
    name: 'v2.1.0-RC2',
    description: '安全加固版本：账号风控、登录锁定、JWT无感刷新支持',
    release_date: '2026-10-25',
    status: 'testing',
  },
  {
    id: 'ver-002',
    project_id: 'proj-001',
    name: 'v2.2.0-Alpha',
    description: '双十一营销大促版本：跨店满减与多级优惠券抵扣引擎',
    release_date: '2026-11-05',
    status: 'developing',
  },
];

export const INITIAL_ENVIRONMENTS: TestEnvironment[] = [
  {
    id: 'env-001',
    name: '测试环境-SIT1',
    base_url: 'https://sit1-ecommerce.internal.net',
    status: 'healthy',
    description: '主干特性验证环境，每天 03:00 自动从 main 分支持续集成构建。',
  },
  {
    id: 'env-002',
    name: '预发布环境-Staging',
    base_url: 'https://staging-ecommerce.internal.net',
    status: 'healthy',
    description: '与生产 1:1 数据脱敏环境，用于最终发布前演练与性能压测。',
  },
  {
    id: 'env-003',
    name: '生产灾备环境-DR',
    base_url: 'https://dr-ecommerce.internal.net',
    status: 'degraded',
    description: '异地多活灾备链路，当前正进行网络专线割接演练。',
  },
];

export const INITIAL_KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: 'kb-001',
    project_id: 'proj-001',
    category: '测试规范与准则',
    title: '敏捷测试用例设计与评审标准规范 (v3.0)',
    tags: '规范, 用例评审, 准出标准',
    content: `# 敏捷测试用例设计与评审标准规范

## 1. 测试用例核心要素
每个用例必须清晰包含：
- **前置条件**：账号角色、测试数据、设备环境与前提状态。
- **操作步骤**：动词驱动、步骤清晰，避免含糊描述。
- **预期结果**：包括界面表现、数据落库、接口返回、错误码等可量化验证指标。

## 2. 优先级判定原则
- **P0（阻塞性）**：核心业务主流程，如登录、下单、支付，阻断则无法交付。
- **P1（高优先级）**：核心功能分支、逆向流程、异常提示、风控拦截。
- **P2（中优先级）**：边界条件、并发竞争、偶发边界、弱网重试。
- **P3（低优先级）**：页面UI微调、非核心提示文案。`,
    created_at: '2026-10-01 10:00:00',
  },
  {
    id: 'kb-002',
    project_id: 'proj-001',
    category: '排障与工具指南',
    title: 'Android 移动端 ADB 常用命令与 Logcat 日志抓取秘籍',
    tags: 'ADB, Android, 移动测试, 崩溃排查',
    content: `# Android 移动端 ADB 调试备忘录

## 1. 抓取 Crash 与 ANR 日志
\`\`\`bash
adb logcat -v time *:E | grep -E "AndroidRuntime|FATAL"
adb pull /data/anr/traces.txt ./anr_traces.txt
\`\`\`

## 2. 模拟弱网与电池状态
\`\`\`bash
adb shell dumpsys battery set level 10
adb shell am broadcast -a android.intent.action.BATTERY_LOW
\`\`\`

## 3. Monkey 随机稳定性测试
\`\`\`bash
adb shell monkey -p com.example.ecommerce --throttle 150 -v 50000 > monkey.log
\`\`\``,
    created_at: '2026-10-04 15:00:00',
  },
];

export const INITIAL_AI_MODELS: AiModel[] = [
  {
    id: 'model-001',
    name: 'Gemini 3.8 Flash (内置推荐)',
    provider: 'Google Gemini',
    model_name: 'gemini-3.8-flash',
    temperature: 0.7,
    is_default: true,
  },
  {
    id: 'model-002',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'Google Gemini',
    model_name: 'gemini-3.1-flash-lite',
    temperature: 0.5,
    is_default: false,
  },
];

export const INITIAL_AI_SKILLS: AiSkill[] = [
  {
    id: 'skill-001',
    name: '需求 PRD 一键拆解为测试用例',
    description: '输入 PRD 文档或需求描述，自动分析等价类、边界值、异常场景并输出完整测试用例步骤。',
    input_template: '需求标题：{title}\n需求详情：{content}\n所属模块：{module}',
    prompt_template: `你是一位资深高级测试架构师。请针对以下软件需求，进行系统化的测试用例设计。
要求：
1. 覆盖正常流程、边界值场景、异常逆向场景、安全风控场景。
2. 每个用例包含：用例标题、优先级(P0/P1/P2)、前置条件、测试类型(functional/security/performance)、详细步骤与预期结果。
3. 请以规范 JSON 数组形式输出。

{input}`,
    model_id: 'model-001',
    status: 'enabled',
  },
  {
    id: 'skill-002',
    name: '错误日志与 Bug 根因智能定位',
    description: '输入崩溃日志、报错堆栈或网络响应，精准定位代码故障点并给出修复建议。',
    input_template: '错误日志/堆栈：\n{log}\n复现步骤：\n{steps}',
    prompt_template: `你是一位全栈研发兼测试专家。请深入分析以下系统异常日志与复现步骤，给出：
1. 错误根因分析（Root Cause）
2. 影响范围评估
3. 推荐的修复补丁代码建议
4. 预防二次引入的测试验证点

{input}`,
    model_id: 'model-001',
    status: 'enabled',
  },
  {
    id: 'skill-003',
    name: '自动化测试脚本代码生成器',
    description: '根据测试用例步骤描述，生成高质量 Playwright (TypeScript) 或 Pytest 测试代码。',
    input_template: '用例标题：{title}\n测试步骤：\n{steps}\n目标框架：{framework}',
    prompt_template: `请为以下测试用例编写健壮、可维护的自动化测试代码。
包含必要的页面对象等待、断言、错误重试与详细注释。

{input}`,
    model_id: 'model-001',
    status: 'enabled',
  },
];

export const INITIAL_AI_PROMPTS: AiPromptTemplate[] = [
  {
    id: 'prompt-001',
    name: '边界值与极限压力测试矩阵',
    content: '请针对输入字段 {field_name}（类型：{field_type}，有效区间：{valid_range}）设计极限边界值测试集合。',
    variables: 'field_name, field_type, valid_range',
  },
  {
    id: 'prompt-002',
    name: '接口安全攻击用例生成',
    content: '分析接口 {api_endpoint}，设计针对 SQL 注入、XSS、垂直越权及重放攻击的测试用例。',
    variables: 'api_endpoint',
  },
];

export const INITIAL_TRACKING_EVENTS: TrackingEvent[] = [
  {
    id: 'trk-001',
    project_id: 'proj-001',
    event_name: '用户登录提交',
    event_key: 'user_login_submit',
    page: 'login_view',
    element_id: 'btn_login_submit',
    trigger_type: 'click',
    schema_json: '{"user_id": "string", "login_method": "pwd|sms|sso", "client_ip": "ip", "device_os": "string"}',
    count: 1420,
    status: 'normal',
    ignored: false,
    last_triggered_at: '2026-10-19 09:42:15',
  },
  {
    id: 'trk-002',
    project_id: 'proj-001',
    event_name: '商品加购行为',
    event_key: 'cart_add_item',
    page: 'product_detail',
    element_id: 'btn_add_to_cart',
    trigger_type: 'click',
    schema_json: '{"sku_id": "string", "quantity": "number", "price": "number", "coupon_id": "string?"}',
    count: 3892,
    status: 'normal',
    ignored: false,
    last_triggered_at: '2026-10-19 10:01:03',
  },
  {
    id: 'trk-003',
    project_id: 'proj-001',
    event_name: '订单结算发起异常',
    event_key: 'checkout_submit_error',
    page: 'checkout_confirm',
    element_id: 'btn_submit_order',
    trigger_type: 'error',
    schema_json: '{"cart_id": "string", "error_code": "string", "error_msg": "string", "latency": "number"}',
    count: 12,
    status: 'warning',
    ignored: false,
    last_triggered_at: '2026-10-19 08:30:19',
  },
];

export const INITIAL_ADB_DEVICES: AdbDevice[] = [
  {
    serial: 'emulator-5554',
    state: 'device',
    model: 'Pixel 8 Pro (Virtual)',
    version: '14.0 (API 34)',
    resolution: '1344 x 2992',
    ip: '127.0.0.1:5555',
    battery: 98,
  },
  {
    serial: 'R5CW206YHXK',
    state: 'device',
    model: 'Samsung Galaxy S24 Ultra',
    version: '14.0 (OneUI 6.1)',
    resolution: '1440 x 3120',
    ip: '192.168.3.108:5555',
    battery: 84,
  },
  {
    serial: 'xiaomi_14_pro_lab',
    state: 'offline',
    model: 'Xiaomi 14 Pro',
    version: '14.0 (HyperOS)',
    resolution: '1440 x 3200',
    battery: 15,
  },
];
