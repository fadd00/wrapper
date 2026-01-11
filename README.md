# Email Receipt API Wrapper

API wrapper untuk kirim email receipt menggunakan Resend. Backend pakai Elysia.js (Bun), frontend pakai Astro.

## Requirements

- **Bun** (untuk backend dan frontend)
- **Podman/Docker** (untuk database PostgreSQL)
- **Resend API Key** (daftar di [resend.com](https://resend.com))

## Setup

### 1. Database
```bash
podman run -d \
  --name postgres-wrapper \
  -e POSTGRES_USER=wrapper \
  -e POSTGRES_PASSWORD=wrapper123 \
  -e POSTGRES_DB=wrapper_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend
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

### 3. Frontend
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

```bash
curl -X POST http://localhost:3000/api/send-receipt \
  -H "X-API-Key: wp_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "item": "Laptop",
    "harga": "5000000",
    "email": "customer@example.com"
  }'
```

## API Documentation

Swagger docs: `http://localhost:3000/swagger`

## License

MIT
