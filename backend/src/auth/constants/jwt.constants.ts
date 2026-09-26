export const jwtConstanst = {
    secret: process.env.JWT_SECRET || (() => {
        throw new Error('JWT_SECRET debe estar configurado antes de iniciar el backend');
    })(),
};