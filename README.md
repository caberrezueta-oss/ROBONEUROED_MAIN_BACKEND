# RoboNeuroED Backend

API REST en Node.js + Express + PostgreSQL (Sequelize) para el sistema RoboNeuroED.

## 1. Requisitos previos

- Node.js 18+ instalado
- PostgreSQL instalado y corriendo localmente (o accesible por red)

## 2. Instalación

```bash
cd RoboNeuroED_Backend
npm install
```

## 3. Configurar variables de entorno

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Abre `.env` y ajusta `DB_USER`, `DB_PASSWORD`, `DB_NAME` a los de tu PostgreSQL local.

## 4. Crear la base de datos

Antes de correr el backend, la base de datos debe existir (Sequelize crea las
tablas, pero no la base de datos en sí).

```bash
# Conéctate a psql
psql -U postgres

# Dentro de psql:
CREATE DATABASE roboneuro_db;
\q
```

## 5. Levantar el servidor

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

Si todo salió bien verás en la consola:

```
✅ Conexión a PostgreSQL establecida.
✅ Modelos sincronizados con la base de datos.
✅ Usuario admin creado: admin@neuroed.com
✅ Configuración por defecto creada.
✅ Banco de preguntas inicial creado.
🚀 RoboNeuroED Backend corriendo en http://localhost:4000
```

El usuario admin se crea automáticamente con el correo/contraseña que pusiste
en `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), por defecto
`admin@neuroed.com` / `123456` — los mismos del Login.jsx del frontend.

## 6. Probar que está vivo

```bash
curl http://localhost:4000/api/health
```

## 7. Endpoints principales

Todos los endpoints (excepto `/api/auth/login`) requieren el header:
`Authorization: Bearer <token>`

| Método | Ruta                                | Descripción                                 |
|--------|--------------------------------------|----------------------------------------------|
| POST   | /api/auth/login                      | Login, devuelve el JWT                       |
| GET    | /api/auth/me                         | Datos del usuario autenticado                |
| GET    | /api/students                        | Lista de estudiantes                         |
| POST   | /api/students                        | Crear estudiante                             |
| PUT    | /api/students/:id                    | Editar estudiante                            |
| DELETE | /api/students/:id                    | Eliminar estudiante                          |
| GET    | /api/sessions                        | Bitácora de sesiones (?student=nombre)       |
| POST   | /api/sessions                        | Registrar una sesión nueva                   |
| GET    | /api/sessions/stats/dashboard        | Tarjetas del Dashboard                       |
| GET    | /api/sessions/stats/weekly-attention | Datos para la gráfica semanal                |
| GET    | /api/questions                       | Banco de preguntas                           |
| POST   | /api/questions                       | Crear pregunta                               |
| DELETE | /api/questions/:id                   | Eliminar pregunta                            |
| GET    | /api/config                          | Configuración global                         |
| PUT    | /api/config                          | Actualizar configuración global              |

## 8. Ejemplo de login con curl

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@neuroed.com\",\"password\":\"123456\"}"
```

Copia el `token` de la respuesta y úsalo así en las siguientes peticiones:

```bash
curl http://localhost:4000/api/sessions \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```
