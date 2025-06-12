declare const API_URL = "http://localhost:3001/api/v1";
declare const ADMIN_USER: {
    name: string;
    email: string;
    password: string;
    role: string;
};
declare function createAdminUser(): Promise<void>;
declare function testLogin(): Promise<void>;
