export declare class CreateCourtDto {
    name: string;
    type: 'covered' | 'uncovered';
    imagePath?: string;
    capacity: number;
    pricePerHour: number;
    status: 'available' | 'occupied' | 'maintenance';
}
