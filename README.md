# Gestión de Canchas UCN

Sistema web para la administración de canchas deportivas de la Universidad Católica del Norte. Permite a los usuarios consultar disponibilidad, reservar horarios y revisar sus reservas. El personal administrador puede gestionar canchas, productos/equipamiento, usuarios y reservas desde un dashboard con estadísticas.

## Funcionalidades

- Registro, inicio y cierre de sesión mediante autenticación JWT.
- Recuperación de contraseña mediante código enviado por correo.
- Consulta de canchas, horarios disponibles y estado de cada cancha.
- Creación de reservas con selección de cancha, horario, jugadores y equipamiento.
- Pago y cancelación de reservas.
- Perfil de usuario con historial de reservas y saldo.
- Administración de canchas: crear, editar, eliminar y cambiar estado.
- Administración de productos o equipamiento: inventario, stock y productos con bajo inventario.
- Dashboard administrativo con estadísticas de reservas, uso de canchas y actividad reciente.
- Carga y consulta de imágenes para canchas y productos mediante `/uploads`.

## Arquitectura

El proyecto está dividido en dos aplicaciones:

```text
GestionDeCanchas/
├── backend/       # API REST con NestJS, TypeORM y PostgreSQL
└── frontend/app/  # Cliente web con React, Vite, TypeScript y Tailwind CSS
```

### Tecnologías principales

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, Recharts y Lucide React.
- **Backend:** Node.js, NestJS 11, TypeORM, Passport JWT, class-validator y Swagger.
- **Base de datos:** PostgreSQL 15.
- **Infraestructura local:** Docker Compose para iniciar PostgreSQL.

## Requisitos

- Node.js 18 o superior.
- npm, pnpm o Yarn.
- Docker Desktop, si se desea ejecutar PostgreSQL mediante Docker.
- Una cuenta SMTP si se quiere habilitar el envío real de correos de recuperación.

## Configuración local

### 1. Iniciar PostgreSQL

Desde la carpeta `backend`:

```bash
docker compose up -d postgresDB
```

El contenedor publica PostgreSQL en el puerto `5433` del equipo local y utiliza, por defecto, estos valores:

| Variable | Valor local |
| --- | --- |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5433` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `DB_NAME` | `dbingeso` |

### 2. Configurar y ejecutar el backend

Crear `backend/.env` con las variables de conexión:

```env
# En producción se puede usar DATABASE_URL en lugar de las variables individuales.
DATABASE_URL=
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dbingeso
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SYNCHRONIZE=true
PORT=3001
JWT_SECRET=replace-with-a-long-random-secret

# Opcionales: necesarios para enviar correos de recuperación
EMAIL_SERVICE=gmail
EMAIL_USER=tu-correo@example.com
EMAIL_PASSWORD=tu-clave-o-token-smtp
EMAIL_FROM=tu-correo@example.com
```

Instalar dependencias y arrancar la API:

```bash
cd backend
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3001/api/v1`. Las imágenes cargadas se sirven desde `http://localhost:3001/uploads/`.

Para crear un usuario administrador con el script incluido:

```bash
npm run create-admin
```

### 3. Configurar y ejecutar el frontend

En otra terminal:

```bash
cd frontend/app
npm install
npm run dev
```

La aplicación web queda disponible normalmente en `http://localhost:5173`.

Comandos adicionales del frontend:

```bash
npm run build    # Compilación de producción
npm run preview  # Servir la compilación localmente
npm run lint    # Revisar el código
```

## Despliegue en Coolify

El despliegue recomendado en Coolify utiliza tres recursos separados:

1. Una base de datos PostgreSQL creada desde Coolify.
2. Un servicio backend construido desde `GestionDeCanchas/backend/Dockerfile`.
3. Un servicio frontend construido desde `GestionDeCanchas/frontend/app/Dockerfile`.

### Base de datos PostgreSQL

Crear una base de datos PostgreSQL en Coolify y copiar sus datos de conexión al backend. Para `DB_HOST`, usar el hostname interno que entrega Coolify, no `localhost`. Mantener la base de datos en una red accesible por el servicio backend y conservar el volumen persistente.

### Servicio backend

- **Dockerfile:** `backend/Dockerfile`.
- **Directorio raíz o contexto:** `GestionDeCanchas/backend`.
- **Puerto expuesto:** `3001`.
- **Health check:** `GET /health`.

Variables requeridas:

```env
DB_HOST=<hostname-interno-de-postgresql>
DB_PORT=5432
DB_USER=<usuario-postgresql>
DB_PASSWORD=<password-postgresql>
DB_NAME=<base-de-datos>
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SYNCHRONIZE=false
PORT=3001
FRONTEND_URL=https://<dominio-del-frontend>
JWT_SECRET=<secreto-largo-y-aleatorio>
```

También se puede configurar la conexión con una única variable `DATABASE_URL`. Si se define, TypeORM la utilizará como URL de conexión; las variables individuales quedan como alternativa para el entorno local.

`JWT_SECRET` es obligatorio y nunca debe publicarse en el repositorio. Para crear el administrador mediante `npm run create-admin`, define además `ADMIN_EMAIL` y `ADMIN_PASSWORD` como variables temporales o secretas en Coolify.

Variables opcionales para recuperación de contraseña:

```env
EMAIL_USER=<cuenta-smtp>
EMAIL_PASSWORD=<token-o-clave-smtp>
```

Asignar un dominio público al backend, por ejemplo `https://api.canchas.example.com`. La API estará disponible en `https://api.canchas.example.com/api/v1`.

### Servicio frontend

- **Dockerfile:** `frontend/app/Dockerfile`.
- **Directorio raíz o contexto:** `GestionDeCanchas/frontend/app`.
- **Puerto expuesto:** `80`.
- **Health check:** `GET /health`.

En las variables o argumentos de build del servicio frontend, definir:

```env
VITE_API_URL=https://<dominio-del-backend>/api/v1
```

`VITE_API_URL` se incorpora durante la compilación de Vite. Después de cambiarla es necesario volver a desplegar o reconstruir el frontend. Asignar al frontend el dominio principal de la aplicación, por ejemplo `https://canchas.example.com`.

### Orden de despliegue

1. Crear PostgreSQL y verificar sus credenciales.
2. Desplegar el backend con sus variables y comprobar `/health`.
3. Configurar `FRONTEND_URL` con el dominio real del frontend.
4. Desplegar el frontend con `VITE_API_URL` apuntando al backend.
5. Probar registro, login, consulta de disponibilidad y creación de reservas.

El directorio `backend/uploads` contiene archivos cargados por los usuarios. En producción se recomienda asociar un volumen persistente de Coolify a `/app/uploads` o migrar estos archivos a almacenamiento de objetos; de lo contrario, podrían perderse al recrear el contenedor.

## Comandos del backend

```bash
npm run build      # Compilar TypeScript
npm run start:dev  # Ejecutar en modo desarrollo con recarga
npm run start:prod # Ejecutar la compilación de producción
npm run lint       # Revisar y corregir problemas de ESLint
npm run test       # Ejecutar pruebas unitarias
npm run test:e2e   # Ejecutar pruebas end-to-end
npm run test:cov   # Generar reporte de cobertura
```

## API

Todas las rutas de la API utilizan el prefijo `/api/v1`.

| Módulo | Ruta base | Responsabilidad |
| --- | --- | --- |
| Autenticación | `/auth` | Registro, login, perfil, logout y recuperación de contraseña |
| Usuarios | `/users` | Gestión de usuarios y saldo |
| Canchas | `/courts` | CRUD, estados y estadísticas de uso |
| Reservas | `/reservations` | Disponibilidad, creación, pago, cancelación y estadísticas |
| Productos | `/products` | Inventario, stock y productos disponibles |
| Tarjetas | `/cards` | Gestión de tarjetas asociadas al usuario |
| Dashboard | `/dashboard` | Estadísticas generales para administración |

Las rutas protegidas requieren un token JWT en el encabezado:

```http
Authorization: Bearer <token>
```

## Base de datos

TypeORM está configurado con `synchronize: true` para el entorno actual, por lo que el esquema se sincroniza automáticamente al iniciar el backend. No se recomienda mantener esta opción habilitada en producción sin una estrategia de migraciones revisada.

Para detener la base de datos local:

```bash
docker compose down
```

Para eliminar también los datos persistidos, usar `docker compose down -v` con precaución.

## Estructura relevante

```text
backend/src/
├── auth/          # Autenticación, JWT y recuperación de contraseña
├── courts/        # Gestión de canchas
├── reservations/  # Reservas y disponibilidad
├── products/      # Productos y equipamiento
├── users/         # Usuarios y saldos
├── dashboard/     # Estadísticas administrativas
├── card/          # Tarjetas de pago
└── main.ts        # Configuración de CORS, validación y puerto

frontend/app/src/
├── components/    # Componentes reutilizables y flujos de reserva
├── pages/         # Vistas de usuario y administración
├── service/       # Clientes para consumir la API
├── context/       # Estado global de autenticación
└── types/         # Tipos compartidos del frontend
```

## Notas de desarrollo

- En desarrollo, el frontend consume `http://localhost:3001/api/v1` por defecto. En Coolify debe definirse `VITE_API_URL` con la URL pública del backend.
- El backend permite solicitudes CORS desde los puertos locales `3001` y `5173`, además de los dominios indicados en `FRONTEND_URL`.
- No se deben subir archivos `.env`, credenciales SMTP ni datos de la base de datos al repositorio.
