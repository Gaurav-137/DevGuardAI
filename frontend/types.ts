
export interface Developer {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface ActivityRecord {
  id: number;
  developer_id: number;
  work_hours: number;
  commits: number;
  pull_requests: number;
  meetings: number;
  tasks_completed: number;
  pending_tasks: number;
  activity_date: string;
}

export interface ProductivityMetric {
  id: number;
  developer_id: number;
  burnout_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  measured_at: string;
}

export interface AIInsight {
  id: number;
  developer_id: number;
  insight_text: string;
  severity: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface DashboardData {
  developer: Developer;
  latestMetric: ProductivityMetric;
  activities: ActivityRecord[];
  insights: AIInsight[];
}
