export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  growth: number;
  lastRegistered: Date | null;
}