export const API_CONFIG = {
  BASE_URL: "http://192.168.11.131:3000",
  API_PREFIX: "/api",
  TIMEOUT: 10000,

  // Rate Limits
  RATE_LIMITS: {
    GENERAL: 100, // per 15 minutes
    FILE_UPLOADS: 20, // per hour
    AI_ENDPOINTS: 50, // per hour
    RECOMMENDATIONS: 10, // per hour
  },
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },

  // User Management
  USER: {
    PROFILE: "/user/profile",
    SUBSCRIPTION_STATUS: "/user/subscription-status",
    UPGRADE_PREMIUM: "/user/upgrade-premium",
    CANCEL_PREMIUM: "/user/cancel-premium",
    EXPORT_ELIGIBILITY: "/user/export-eligibility",
    REWARD_AD_COMPLETED: "/user/reward-ad-completed",
    USAGE: "/user/usage",
  },

  // Account Management
  ACCOUNTS: {
    LIST: "/accounts",
    DETAIL: (id: string) => `/accounts/${id}`,
    CREATE: "/accounts",
    UPDATE: (id: string) => `/accounts/${id}`,
    DELETE: (id: string) => `/accounts/${id}`,
    BALANCE_HISTORY: (id: string, days = 30) =>
      `/accounts/${id}/balance-history?days=${days}`,
    SUMMARY: (id: string, period = "month") =>
      `/accounts/${id}/summary?period=${period}`,
  },

  // Transaction Management
  TRANSACTIONS: {
    LIST: (page = 1, limit = 20) => `/transactions?page=${page}&limit=${limit}`,
    CALENDAR: (year: number, month: number) => `/transactions/calendar/${year}/${month}`,
    CALENDAR_DATE_RANGE: (startDate: string, endDate: string) => 
      `/transactions?start_date=${startDate}&end_date=${endDate}`,
    CREATE: "/transactions",
    UPDATE: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
    BULK_IMPORT: "/transactions/bulk-import",
    EXPORT: (format = "excel", startDate?: string, endDate?: string, unlockToken?: string) => {
      let url = `/transactions/export?format=${format}`;
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      if (unlockToken) {
        url += `&unlock_token=${unlockToken}`;
      }
      return url;
    },
  },

  // Category Management
  CATEGORIES: {
    LIST: "/categories",
    HIERARCHY: "/categories/hierarchy",
    CREATE: "/categories",
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Budget Management
  BUDGETS: {
    LIST: "/budgets",
    DETAIL: (id: string) => `/budgets/${id}`,
    CREATE: "/budgets",
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
  },

  // Bill Reminders
  BILLS: {
    LIST: "/bills",
    UPCOMING: (days = 30) => `/bills/upcoming?days=${days}`,
    CREATE: "/bills",
    UPDATE: (id: string) => `/bills/${id}`,
    MARK_PAID: (id: string) => `/bills/${id}/mark-paid`,
    DELETE: (id: string) => `/bills/${id}`,
  },

  // Goals
  GOALS: {
    LIST: "/goals",
    DETAIL: (id: string) => `/goals/${id}`,
    CREATE: "/goals",
    UPDATE: (id: string) => `/goals/${id}`,
    DELETE: (id: string) => `/goals/${id}`,
    CONTRIBUTE: (id: string) => `/goals/${id}/contribute`,
    PROGRESS: (id: string) => `/goals/${id}/progress`,
    AI_START_SESSION: "/goals/ai/start-session",
    AI_CHAT: "/goals/ai/chat",
    AI_SESSION: (sessionId: string) => `/goals/ai/session/${sessionId}`,
    AI_FINALIZE: "/goals/ai/finalize",
    AI_CANCEL: (sessionId: string) => `/goals/ai/session/${sessionId}`,
  },

  // Recommendations
  RECOMMENDATIONS: {
    LIST: "/recommendations",
    HISTORY: "/recommendations/history",
    DISMISS: (id: string) => `/recommendations/${id}/dismiss`,
    ACT: (id: string) => `/recommendations/${id}/act`,
    FEEDBACK: (id: string) => `/recommendations/${id}/feedback`,
    GENERATE: "/recommendations/generate",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD: "/notifications/unread",
    READ: (id: string) => `/notifications/${id}/read`,
    CLICK: (id: string) => `/notifications/${id}/click`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    PREFERENCES: "/notifications/preferences",
  },

  // Analytics
  ANALYTICS: {
    SPENDING_TRENDS: (months = 6) =>
      `/analytics/spending-trends?months=${months}`,
    CATEGORY_BREAKDOWN: (startDate: string, endDate: string) =>
      `/analytics/category-breakdown?start_date=${startDate}&end_date=${endDate}`,
    PREDICTIVE_ALERTS: "/analytics/predictive-alerts",
  },

  // Premium Features
  PREMIUM: {
    ACCOUNT_SHARES: "/premium/account-shares",
    SHARE_ACCOUNT: "/premium/account-shares",
    UPDATE_SHARE: (id: string) => `/premium/account-shares/${id}`,
    REMOVE_SHARE: (id: string) => `/premium/account-shares/${id}`,
    ANALYTICS_DASHBOARD: "/premium/analytics-dashboard",
  },

  // Statement Import
  STATEMENTS: {
    FORMATS: "/statements/formats",
    UPLOAD: "/statements/upload",
    STATUS: (id: string) => `/statements/upload/${id}/status`,
    PREVIEW: (id: string) => `/statements/upload/${id}/preview`,
    IMPORT: (id: string) => `/statements/upload/${id}/import`,
    HISTORY: "/statements/history",
  },

  // Insights
  INSIGHTS: {
    DASHBOARD: "/insights/dashboard",
    WEEKLY_REPORT: "/insights/weekly-report",
    MONTHLY_REPORT: "/insights/monthly-report",
  },

  // System
  HEALTH: "/health",
};


