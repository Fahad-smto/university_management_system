// TODO: define the exact response shape returned by each dashboard aggregation

export type IGuestDashboard = {
  notices: unknown[];
  upcomingEvents: unknown[];
  upcomingElection: unknown;
};

export type IUserDashboard = {
  membership: unknown;
  currentDue: unknown;
  payments: unknown[];
  events: unknown;
  election: unknown;
  complaints: unknown[];
};

export type IModeratorDashboard = {
  pendingComplaints: unknown[];
  myEvents: unknown[];
  myNotices: unknown[];
};

export type IAdminDashboard = {
  totalMembers: number;
  activeMembers: number;
  totalRevenue: number;
  pendingComplaints: number;
  upcomingEvents: number;
};
