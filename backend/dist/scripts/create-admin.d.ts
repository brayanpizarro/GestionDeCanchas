declare const API_URL: string;
declare const ADMIN_USER: {
    name: string;
    email: string | undefined;
    password: string | undefined;
    role: string;
};
declare function createAdminUser(): Promise<void>;
declare function testLogin(): Promise<void>;
