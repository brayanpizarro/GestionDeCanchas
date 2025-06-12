import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
export declare class CourtsController {
    private readonly courtsService;
    constructor(courtsService: CourtsService);
    create(createCourtDto: CreateCourtDto, file: Express.Multer.File): Promise<import("./entities/court.entity").Court>;
    findAll(): Promise<import("./entities/court.entity").Court[]>;
    findOne(id: string): Promise<import("./entities/court.entity").Court>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<import("./entities/court.entity").Court>;
    update(id: string, updateCourtDto: UpdateCourtDto, file: Express.Multer.File): Promise<import("./entities/court.entity").Court>;
    remove(id: string): Promise<void>;
    getCourtUsage(): Promise<{
        id: string;
        name: string;
        totalHours: number;
        usagePercentage: number;
        reservationsCount: number;
        revenue: number;
    }[]>;
}
