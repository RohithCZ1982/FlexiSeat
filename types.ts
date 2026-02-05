
export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  FLOOR_MAP = 'FLOOR_MAP',
  ASSIGN_TEAM = 'ASSIGN_TEAM',
  STATS = 'STATS',
  PROFILE = 'PROFILE',
  TEAM_BOOKINGS = 'TEAM_BOOKINGS',
  CONFIRMATION = 'CONFIRMATION',
  ADMIN_USERS = 'ADMIN_USERS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  teamLeadId?: string; // Optional: ID of the Team Lead assigned to this user
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  teamLeadId?: string;
}

export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  role: string;
  deskId: string;
  zone: string;
  level: number;
  status: 'Accepted' | 'Pending' | 'Rejected';
  dateRange: string;
  timestamp: number;
}

export interface Desk {
  id: string;
  zone: string;
  level: number;
  status: 'available' | 'occupied' | 'selected';
}
