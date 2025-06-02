
export interface DashboardStats {
    users: UserStats;
    products: ProductStats;
    courts: CourtStats;
    summary: DashboardSummary;
    weeklyStats: WeeklyStats[];
    courtUsage: CourtUsage[];
    recentReservations: RecentReservation[];
    topPlayers: TopPlayer[];
    activePlayers: number;
    reservationsToday: number;
    dailyIncome: number;
    occupancyRate: number;
}

export interface WeeklyStats {
    name: string;
    reservas: number;
    ingresos: number;
}

export interface UserStats {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    growth: number;
    lastRegistered: Date | null;
}

export interface ProductStats {
    total: number;
    available: number;
    totalStock: number;
    lowStock: number;
    categories: any[];
}

export interface CourtStats {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    totalReservations: number;
    averageRating?: number; // if your service returns this
    underMaintenance?: number; // if your service returns this instead of maintenance
}

export interface DashboardSummary {
    totalUsers: number;
    activeUsers: number;
    totalProducts: number;
    totalStock: number;
    totalCourts: number;
    availableCourts: number;
    totalReservations: number;
    dailyIncome: number;
}

export interface CourtUsage {
    id: string;
    name: string;
    totalHours: number;
    usagePercentage: number;
    reservationsCount: number;
    revenue: number;
}

export interface RecentActivity {
    reservations: RecentReservation[];
    products: RecentProductTransaction[];
}

export interface RecentReservation {
    id: string;
    courtName: string;
    userName: string;
    date: Date;
    status: string;
    amount: number;
}

export interface RecentProductTransaction {
    id: string;
    productName: string;
    quantity: number;
    amount: number;
    type: 'IN' | 'OUT';
    date: Date;
}

export interface TopPlayer {
    id: number;
    name: string;
    reservas: number;
    gasto: string;
    nivel: string;
    avatar: string;
}
