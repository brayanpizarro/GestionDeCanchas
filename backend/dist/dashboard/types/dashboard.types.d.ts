export interface WeeklyStats {
    name: string;
    reservas: number;
    ingresos: number;
}
export interface CourtUsage {
    name: string;
    value: number;
    color: string;
}
export interface RecentReservation {
    id: number;
    court: string;
    player: string;
    time: string;
    date: string;
    status: string;
    amount: string;
}
export interface TopPlayer {
    id: number;
    name: string;
    reservas: number;
    gasto: string;
    nivel: string;
    avatar: string;
}
export interface DashboardStats {
    reservationsToday: number;
    dailyIncome: number;
    activePlayers: number;
    occupancyRate: number;
    weeklyStats: WeeklyStats[];
    courtUsage: CourtUsage[];
    recentReservations: RecentReservation[];
    topPlayers: TopPlayer[];
}
export {};
