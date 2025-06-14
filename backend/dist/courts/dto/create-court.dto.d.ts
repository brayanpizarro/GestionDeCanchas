export declare class CreateCourtDto {
    name: string;
    type: 'covered' | 'uncovered';
    isCovered?: boolean;
    imagePath?: string;
    capacity: number;
    pricePerHour: number;
    status: 'available' | 'occupied' | 'maintenance';
}
