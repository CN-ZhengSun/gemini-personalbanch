export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at?: string;
}

export interface PRD {
  id: string;
  project_id: string;
  title: string;
  content: string;
  version: string;
  author: string;
  status: 'draft' | 'reviewing' | 'approved' | 'published';
  created_at: string;
}

export interface Requirement {
  id: string;
  project_id: string;
  prd_id?: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  module: string;
  status: 'draft' | 'reviewing' | 'approved' | 'developing' | 'testing' | 'done';
  case_count?: number;
  created_at: string;
}

export interface TestCaseStep {
  step_no: number;
  action: string;
  expected: string;
}

export interface TestCase {
  id: string;
  project_id: string;
  module: string;
  title: string;
  preconditions: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  case_type: 'functional' | 'api' | 'ui' | 'performance' | 'security';
  steps: TestCaseStep[];
  requirement_ids: string[];
  tags: string[];
  status: 'active' | 'deprecated';
  author: string;
  created_at: string;
}

export interface TestPlan {
  id: string;
  project_id: string;
  version_id?: string;
  name: string;
  description: string;
  start_date?: string;
  end_date?: string;
  status: 'draft' | 'in_progress' | 'completed';
  case_ids: string[];
  total_cases: number;
  passed_cases: number;
  pass_rate: number;
  created_at: string;
}

export interface TestExecution {
  id: string;
  plan_id: string;
  case_id: string;
  case_title?: string;
  module?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  assignee: string;
  environment: string;
  status: 'pending' | 'pass' | 'fail' | 'blocked' | 'skip';
  actual_result?: string;
  fail_reason?: string;
  duration_ms?: number;
  executed_at?: string;
  bug_id?: string;
}

export interface BugComment {
  id: string;
  bug_id: string;
  user: string;
  content: string;
  created_at: string;
}

export interface Bug {
  id: string;
  project_id: string;
  requirement_id?: string;
  case_id?: string;
  execution_id?: string;
  title: string;
  description: string;
  severity: 'fatal' | 'critical' | 'major' | 'minor' | 'trivial';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'new' | 'assigned' | 'fixing' | 'verifying' | 'closed' | 'rejected';
  assignee: string;
  reporter: string;
  environment?: string;
  version?: string;
  steps_to_reproduce?: string;
  expected_result?: string;
  actual_result?: string;
  created_at: string;
  comments?: BugComment[];
}

export interface AutomationScript {
  id: string;
  project_id: string;
  case_id?: string;
  name: string;
  script_type: 'ui' | 'api' | 'unit' | 'perf';
  framework: 'playwright' | 'pytest' | 'cypress' | 'jest';
  content: string;
  version: string;
  last_status?: 'success' | 'failed' | 'none';
  last_run_at?: string;
}

export interface AutomationTask {
  id: string;
  script_id: string;
  name: string;
  schedule: string;
  environment: string;
  last_run_at?: string;
  status: 'active' | 'paused';
}

export interface ReleaseVersion {
  id: string;
  project_id: string;
  name: string;
  description: string;
  release_date?: string;
  status: 'planning' | 'developing' | 'testing' | 'released';
}

export interface TestEnvironment {
  id: string;
  name: string;
  base_url: string;
  status: 'healthy' | 'degraded' | 'offline';
  description?: string;
}

export interface KnowledgeDoc {
  id: string;
  project_id?: string;
  category: string;
  title: string;
  content: string;
  tags: string;
  created_at: string;
}

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  model_name: string;
  api_key?: string;
  temperature: number;
  is_default: boolean;
}

export interface AiSkill {
  id: string;
  name: string;
  description: string;
  input_template: string;
  prompt_template: string;
  model_id?: string;
  status: 'enabled' | 'disabled';
}

export interface AiPromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: string;
}

export interface TrackingEvent {
  id: string;
  project_id: string;
  event_name: string;
  event_key: string;
  page: string;
  element_id: string;
  trigger_type: string;
  schema_json: string;
  count: number;
  status: 'normal' | 'warning' | 'error';
  ignored: boolean;
  last_triggered_at?: string;
}

export interface AdbDevice {
  serial: string;
  state: 'device' | 'offline' | 'unauthorized';
  model: string;
  version: string;
  resolution: string;
  ip?: string;
  battery?: number;
}
