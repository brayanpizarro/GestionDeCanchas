export declare class PlayerDto {
    firstName: string;
    lastName: string;
    rut: string;
    age: number;
}
export declare class SelectedEquipmentDto {
    id: string;
    name: string;
    price: number;
    quantity: number;
}
export declare class CreateReservationDto {
    courtId: number;
    userId: number;
    startTime: string;
    endTime: string;
    players: PlayerDto[];
    equipment?: SelectedEquipmentDto[];
}
