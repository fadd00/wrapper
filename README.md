# Email Receipt API Wrapper

API wrapper untuk kirim email receipt menggunakan Resend. Backend pakai Elysia.js (Bun), frontend pakai Astro.

## Requirements

- **Bun** (untuk backend dan frontend)
- **PostgreSQL** (atau database lain yang support Prisma)
- **Resend API Key** (daftar di [resend.com](https://resend.com))

## Setup

### 1. Backend
```bash
cd back

# Install dependencies
bun install

# Setup env
cp .env.example .env
# Edit .env, isi RESEND_API_KEY kamu

# Setup database
bunx prisma generate
bunx prisma migrate dev --name init

# Run
bun run dev
```

Backend jalan di `http://localhost:3000`

### 2. Frontend
```bash
cd app

# Install dependencies
bun install

# Setup env (opsional, default sudah ke localhost:3000)
cp .env.example .env

# Run
bun run dev
```

Frontend jalan di `http://localhost:4321`

## Cara Pakai

1. Buka `http://localhost:4321`
2. Register/Login
3. Generate API Key di dashboard
4. Kirim email pakai API key kamu:

## API Documentation

Swagger docs: `http://localhost:3000/swagger`

