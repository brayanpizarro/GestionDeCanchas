const API_URL = process.env.ADMIN_API_URL || 'http://localhost:3001/api/v1';

const ADMIN_USER = {
    name: process.env.ADMIN_NAME || 'Administrador UCN',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin'
};

if (!ADMIN_USER.email || !ADMIN_USER.password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar configurados');
}

async function createAdminUser() {
    try {
        console.log('Creando usuario administrador...');
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ADMIN_USER)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error response:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('Usuario administrador creado exitosamente:', data);
        
        // Probar login inmediatamente
        await testLogin();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error al crear el usuario administrador:', errorMessage);
    }
}

// Función para probar el login inmediatamente después de crear el usuario
async function testLogin() {
    try {
        console.log('Probando login...');
        
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: ADMIN_USER.email,
                password: ADMIN_USER.password
            })
        });

        if (!loginResponse.ok) {
            const errorData = await loginResponse.text();
            console.error('Error en login:', errorData);
            return;
        }

        const loginData = await loginResponse.json();
        console.log('Login exitoso:', loginData);
        
    } catch (error) {
        console.error('Error probando login:', error);
    }
}

createAdminUser();