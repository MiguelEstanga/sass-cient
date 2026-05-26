export interface DashboardStats {
  employees: {
    total: number;
  };
  clients: {
    total:     number;
    new_month: number;
  };
  sales: {
    total:         number;
    today:         number;
    revenue_today: number;
    revenue_month: number;
  };
  appointments: {
    today:   number;
    pending: number;
  };
  sessions: {
    active: number;
  };
}