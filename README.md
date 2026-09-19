# TaskFlow

Aplicación web Full-Stack para la gestión personal de tareas, desarrollada con React, Node.js, Express y PostgreSQL.

TaskFlow permite a cada usuario administrar sus propias tareas y categorías desde una interfaz responsive, con autenticación mediante JWT, búsqueda, filtros, prioridades, fechas límite y un dashboard con estadísticas.

> Proyecto desarrollado como parte de mi formación en Ingeniería de Sistemas e Informática y como proyecto de portafolio Full-Stack.

---

## Características principales

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JSON Web Token (JWT).
- Rutas protegidas en frontend y backend.
- Creación, consulta, edición y eliminación de tareas.
- Estados de tarea:
  - Pendiente.
  - En progreso.
  - Completada.
- Prioridades:
  - Baja.
  - Media.
  - Alta.
- Fechas límite.
- Cálculo de tareas vencidas.
- Registro automático de la fecha de finalización.
- Creación, edición y eliminación de categorías.
- Asignación opcional de categorías a las tareas.
- Búsqueda de tareas por título.
- Filtros por estado, prioridad y categoría.
- Ordenamiento por fecha de creación, fecha límite y prioridad.
- Dashboard con estadísticas y próximas tareas.
- Diseño responsive para escritorio y dispositivos móviles.
- Estados de carga y manejo de errores en la interfaz.
- Validación de datos en el backend.
- Control de acceso para impedir que un usuario consulte o modifique recursos de otro usuario.
- Pruebas automatizadas de integración del backend.

---

## Tecnologías utilizadas

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Fetch API

### Backend

- Node.js
- Express 5
- Prisma ORM 8
- PostgreSQL
- Zod
- JSON Web Token
- bcryptjs
- Helmet
- CORS
- dotenv

### Testing

- Vitest
- Supertest
- Base de datos PostgreSQL independiente para testing

---

## Arquitectura

TaskFlow utiliza una arquitectura cliente-servidor.

```text
┌──────────────────────┐
│       Usuario        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   React + Tailwind   │
│      Frontend        │
└──────────┬───────────┘
           │ HTTP / JSON
           ▼
┌──────────────────────┐
│   Express REST API   │
│       Backend        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Prisma ORM      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

El backend separa las responsabilidades mediante rutas, controladores, servicios, validadores y middlewares.

---

## Estructura del proyecto

```text
TaskFlow/
│
├── backend/
│   ├── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   ├── helpers/
│   │   ├── auth.test.js
│   │   ├── categories.test.js
│   │   ├── health.test.js
│   │   └── tasks.test.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   └── vitest.config.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── docs/
├── .gitignore
└── README.md
```

---

## Modelo de datos

TaskFlow utiliza tres entidades principales.

### User

Representa al usuario de la aplicación.

Un usuario puede tener múltiples tareas y categorías.

### Task

Representa una tarea perteneciente a un usuario.

Incluye:

- título;
- descripción;
- estado;
- prioridad;
- fecha límite;
- fecha de finalización;
- categoría opcional;
- fecha de creación;
- fecha de actualización.

Los estados disponibles son:

```text
PENDING
IN_PROGRESS
COMPLETED
```

Las prioridades disponibles son:

```text
LOW
MEDIUM
HIGH
```

### Category

Permite organizar las tareas de un usuario.

Cada categoría pertenece exclusivamente a un usuario. El nombre de una categoría debe ser único para ese usuario sin distinguir entre mayúsculas y minúsculas.

Al eliminar una categoría, las tareas asociadas se conservan y su referencia a la categoría pasa a `null`.

---

## API REST

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |

### Tareas

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/tasks` | Listar tareas |
| POST | `/api/tasks` | Crear tarea |
| GET | `/api/tasks/:id` | Obtener tarea |
| PUT | `/api/tasks/:id` | Editar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |
| PATCH | `/api/tasks/:id/status` | Cambiar estado |

La consulta de tareas admite parámetros como:

```text
search
status
priority
category
sort
```

Ejemplo:

```text
GET /api/tasks?status=PENDING&priority=HIGH&sort=dueDate
```

### Categorías

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |
| PUT | `/api/categories/:id` | Editar categoría |
| DELETE | `/api/categories/:id` | Eliminar categoría |

---

## Instalación local

### Requisitos

Antes de ejecutar TaskFlow se necesita:

- Node.js
- npm
- PostgreSQL
- Git

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Luciano-HP12/TaskFlow.git
cd TaskFlow
```

---

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crea un archivo `.env` utilizando `.env.example` como referencia.

Variables requeridas:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/taskflow_db
JWT_SECRET=reemplaza_con_un_secreto_seguro
JWT_EXPIRES_IN=1h
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

`JWT_SECRET` debe contener al menos 32 caracteres.

> Nunca se deben versionar los archivos `.env` con credenciales reales.

---

### 3. Preparar la base de datos

Crea una base de datos PostgreSQL llamada, por ejemplo:

```text
taskflow_db
```

Después configura `DATABASE_URL` con las credenciales correspondientes.

Aplica las migraciones:

```bash
npx prisma db migrate
```

Genera nuevamente el contrato de Prisma cuando sea necesario:

```bash
npm run contract:emit
```

---

### 4. Ejecutar el backend

Modo desarrollo:

```bash
npm run dev
```

La API estará disponible por defecto en:

```text
http://localhost:3000
```

Puedes comprobar su funcionamiento mediante:

```text
GET /api/health
```

---

### 5. Configurar el frontend

En otra terminal:

```bash
cd frontend
npm install
```

Crea `.env` tomando `.env.example` como referencia:

```env
VITE_API_URL=http://localhost:3000/api
```

---

### 6. Ejecutar el frontend

```bash
npm run dev
```

Vite mostrará la dirección local desde la que se puede abrir TaskFlow en el navegador.

---

## Testing

El backend cuenta con pruebas automatizadas de integración desarrolladas con Vitest y Supertest.

Actualmente se prueban, entre otros escenarios:

- registro de usuarios;
- inicio de sesión;
- autenticación mediante JWT;
- rutas protegidas;
- CRUD de tareas;
- ownership de tareas;
- cambios de estado;
- manejo de `completedAt`;
- búsqueda;
- filtros;
- ordenamiento;
- CRUD de categorías;
- ownership de categorías;
- categorías duplicadas case-insensitive;
- relación entre tareas y categorías;
- eliminación de categorías mediante `SET NULL`;
- validación de identificadores UUID.

Las pruebas utilizan una base PostgreSQL independiente para evitar modificar los datos del entorno de desarrollo.

Para ejecutar la suite:

```bash
cd backend
npm test
```

Para ejecutar Vitest en modo watch:

```bash
npm run test:watch
```

Estado actual:

```text
Test Files: 4 passed
Tests:      50 passed
```

---

## Seguridad

TaskFlow implementa diferentes medidas de seguridad para el alcance actual del proyecto:

- contraseñas almacenadas mediante hashing con bcrypt;
- autenticación mediante JWT;
- autorización por propietario de los recursos;
- validación de datos mediante Zod;
- validación de identificadores UUID;
- cabeceras de seguridad mediante Helmet;
- configuración de CORS;
- variables sensibles almacenadas fuera del repositorio;
- respuestas de autenticación que no exponen el hash de las contraseñas;
- límite para el cuerpo JSON recibido por la API.

En la versión actual del frontend, el token JWT se almacena en `sessionStorage`.

---

## Capturas de pantalla

> Las capturas de la interfaz serán añadidas una vez completado el despliegue de la aplicación.

---

## Estado del proyecto

TaskFlow se encuentra en la fase final de desarrollo de su primera versión.

El MVP incluye:

- autenticación;
- gestión completa de tareas;
- categorías;
- búsqueda y filtros;
- dashboard;
- diseño responsive;
- seguridad básica del backend;
- manejo de errores;
- pruebas automatizadas de integración.

Las siguientes etapas incluyen la preparación del despliegue, documentación final y publicación de una versión accesible en línea.

---

## Autor

**Luciano**

Estudiante de Ingeniería de Sistemas e Informática.

Proyecto desarrollado con fines de aprendizaje, práctica de desarrollo Full-Stack y construcción de portafolio profesional.