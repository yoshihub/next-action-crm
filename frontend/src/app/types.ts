export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
  current_team_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  type: 'person' | 'company';
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  score: number;
  note?: string;
  next_action_on?: string;
  last_contacted_at?: string;
  archived_at?: string;
  owner?: User;
  deals_count?: number;
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  title: string;
  amount: number;
  stage: 'lead' | 'qualify' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expected_close_on?: string;
  order_index: number;
  lost_reason?: string;
  archived_at?: string;
  contact?: Contact;
  owner?: User;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  priority: 'low' | 'normal' | 'high';
  due_on: string;
  done_at?: string;
  is_completed: boolean;
  is_overdue: boolean;
  assignee?: User;
  contact?: Contact;
  deal?: Deal;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  type: 'call' | 'meeting' | 'mail' | 'note';
  occurred_at: string;
  body: string;
  user?: User;
  contact?: Contact;
  deal?: Deal;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface InboxResponse {
  data: Task[];
  scope: string;
  count: number;
}

export interface DealsResponse {
  data: Record<string, Deal[]>;
}

