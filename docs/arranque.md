# Puesta en marcha — POD

Pasos para levantar la aplicación completa en local (backend Symfony + MySQL + frontend React).

## Requisitos

- PHP 8.3+ y Composer
- Node 18+ y npm
- Docker (para MySQL) — o un MySQL 8 propio
- OpenSSL (para las claves JWT)

## 1. Base de datos (Docker)

Desde la raíz del repositorio:

```bash
docker compose up -d db adminer
```

MySQL queda en `127.0.0.1:3306` (base `pod`, usuario `pod`, contraseña `pod`). Adminer en http://localhost:8081.

## 2. Backend (Symfony)

```bash
cd backend
composer install
```

Genera el par de claves JWT (el passphrase está en `.env`):

```bash
php bin/console lexik:jwt:generate-keypair --overwrite
```

> En Windows, si la extensión OpenSSL de PHP falla, genera las claves con el CLI de OpenSSL:
> ```bash
> mkdir -p config/jwt
> openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:TU_PASSPHRASE
> openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:TU_PASSPHRASE
> ```
> (usa el valor de `JWT_PASSPHRASE` de `.env`).

Crea el esquema:

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

Inicializa la base de datos. Empezar **limpio** (BD vacía + un administrador):

```bash
php bin/console app:init
# o con tus credenciales:
php bin/console app:init "tu@email" "tu-clave" "Tu Nombre"
```

Si en su lugar prefieres **datos de demostración** (proyectos, oportunidades, equipo de ejemplo):

```bash
php bin/console app:seed
```

Arranca el servidor:

```bash
symfony server:start --port=8000
# o, si el symfony-cli da problemas:
php -S 127.0.0.1:8000 -t public public/index.php
```

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**. Vite proxia `/api` al backend en `:8000` (sin CORS en dev).

## 4. Acceso

- Tras `app:init`: **admin@pod.dev** · contraseña **admin** (cámbiala al entrar).
- Tras `app:seed` (demo): **marta@pod.dev** · contraseña **pod** (todos los usuarios usan `pod`).

## IA (opcional)

El asistente IA funciona en **modo demo** sin configuración (genera un borrador heurístico). Para usar un proveedor real, crea `backend/.env.local` con:

```dotenv
AI_PROVIDER=anthropic   # o openai
AI_MODEL=claude-opus-4-8
ANTHROPIC_API_KEY=sk-...
# OPENAI_API_KEY=sk-...
```

Ver la [Capa de IA](arquitectura.md#capa-de-ia).

## Recargar datos de demo

```bash
cd backend && php bin/console app:seed
```

Reinicia los IDs y vuelve a cargar el conjunto de datos.
