// Goal Types and Interfaces for ExpenseWise Manager

export type GoalCategory = 'car' | 'house' | 'vacation' | 'emergency' | 'education' | 'debt' | 'other';
export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type GoalUrgency = 'high' | 'medium' | 'low';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  contributed_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  target_date: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  monthly_target: number;
  monthly_savings_needed: number;
  days_remaining: number;
  total_milestones: number;
  completed_milestones: number;
  milestone_progress: number;
  status_info: {
    is_on_track: boolean;
    urgency: GoalUrgency;
  };
  created_at: string;
  updated_at: string;
  currency?: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  target_amount: number;
  target_date: string;
  achieved_at: string | null;
  is_achieved: boolean;
  days_to_target: number;
  created_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  transaction_id: string;
  amount: number;
  created_at: string;
  description: string;
  transaction_date: string;
  account_name: string;
}

export interface GoalAnalytics {
  average_monthly_contribution: number;
  projected_completion_date: string;
  on_track: boolean;
  expected_progress: number;
  actual_progress: number;
  ahead_behind: number;
  required_monthly_savings: number;
}

export interface GoalProgress {
  goal_id: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  days_remaining: number;
  monthly_contributions: Array<{
    month: string;
    amount: number;
    contribution_count: number;
  }>;
  analytics: GoalAnalytics;
}

export interface GoalCategoryInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const goalCategories: Record<GoalCategory, GoalCategoryInfo> = {
  car: { 
    name: 'Car Purchase', 
    icon: '🚗', 
    color: '#FF6B35',
    description: 'Save for your dream vehicle'
  },
  house: { 
    name: 'House/Property', 
    icon: '🏠', 
    color: '#2E7D57',
    description: 'Build your future home'
  },
  vacation: { 
    name: 'Vacation/Travel', 
    icon: '✈️', 
    color: '#4A90E2',
    description: 'Plan your perfect getaway'
  },
  emergency: { 
    name: 'Emergency Fund', 
    icon: '🛡️', 
    color: '#F5A623',
    description: 'Secure your financial safety'
  },
  education: { 
    name: 'Education', 
    icon: '🎓', 
    color: '#7B68EE',
    description: 'Invest in your knowledge'
  },
  debt: { 
    name: 'Debt Repayment', 
    icon: '💳', 
    color: '#E74C3C',
    description: 'Achieve financial freedom'
  },
  other: { 
    name: 'Other Goal', 
    icon: '🎯', 
    color: '#95A5A6',
    description: 'Your custom financial goal'
  }
};

export interface GoalStatusInfo {
  color: string;
  icon: string;
  label: string;
  description: string;
}

export const goalStatusConfig: Record<GoalStatus, GoalStatusInfo> = {
  active: {
    color: '#2E7D57',
    icon: '🎯',
    label: 'Active',
    description: 'Currently working towards this goal'
  },
  paused: {
    color: '#F5A623',
    icon: '⏸️',
    label: 'Paused',
    description: 'Temporarily on hold'
  },
  completed: {
    color: '#4CAF50',
    icon: '✅',
    label: 'Completed',
    description: 'Successfully achieved'
  },
  cancelled: {
    color: '#E74C3C',
    icon: '❌',
    label: 'Cancelled',
    description: 'No longer pursuing'
  }
};

export const goalPriorityConfig: Record<GoalPriority, GoalStatusInfo> = {
  high: {
    color: '#E74C3C',
    icon: '🔥',
    label: 'High Priority',
    description: 'Focus on this goal first'
  },
  medium: {
    color: '#F5A623',
    icon: '⚡',
    label: 'Medium Priority',
    description: 'Important but not urgent'
  },
  low: {
    color: '#2E7D57',
    icon: '🌱',
    label: 'Low Priority',
    description: 'Long-term objective'
  }
};

export const goalUrgencyConfig: Record<GoalUrgency, GoalStatusInfo> = {
  high: {
    color: '#E74C3C',
    icon: '🚨',
    label: 'Urgent',
    description: 'Needs immediate attention'
  },
  medium: {
    color: '#F5A623',
    icon: '⚠️',
    label: 'Monitor',
    description: 'Keep an eye on progress'
  },
  low: {
    color: '#4CAF50',
    icon: '✅',
    label: 'On Track',
    description: 'Progressing well'
  }
};

// Goal Analytics Response Types
export interface GoalsListResponse {
  goals: Goal[];
}

export interface GoalDetailResponse {
  goal: Goal;
  milestones: GoalMilestone[];
  recent_contributions: GoalContribution[];
  analytics: GoalAnalytics;
}

export interface GoalProgressResponse {
  goal_id: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  days_remaining: number;
  monthly_contributions: Array<{
    month: string;
    amount: number;
    contribution_count: number;
  }>;
  analytics: GoalAnalytics;
}
