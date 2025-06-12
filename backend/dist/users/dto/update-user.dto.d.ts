import { UserRole } from '../entities/user-role.enum';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role: UserRole;
}
