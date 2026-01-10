# Email Receipt API Wrapper

A fullstack application that provides an API wrapper for Resend email service with API key management, user authentication, and request logging. Built with **Elysia.js** (Bun) backend and **Astro** frontend.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🔑 **API Key Management** - Generate, list, and revoke API keys with `wp_` prefix format
- 📧 **Email Sending** - Send beautiful receipt emails via Resend
- 📊 **Request Logging** - Track all API requests with detailed logs
- 📚 **Swagger Documentation** - Interactive API documentation
- 🎨 **Modern Dark UI** - Clean, modern interface inspired by Vercel/Astro

## Tech Stack

### Backend
- **Elysia.js** - Fast Bun web framework
- **Prisma** - Type-safe ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Resend** - Email service
- **Swagger** - API documentation

### Frontend
- **Astro** - Static site generation
- **Vanilla JS** - Client-side interactivity
- **CSS** - Custom dark theme design system

## Prerequisites

- **Bun** v1.0+ installed
- **Podman** for running PostgreSQL container
- **Resend API key** (get one at [resend.com](https://resend.com))

## Setup Instructions

### 1. Clone Repository

```bash
cd wrapper
```

### 2. Setup PostgreSQL with Podman

```bash
# Start PostgreSQL container
podman run -d \
  --name postgres-wrapper \
  -e POSTGRES_USER=wrapper \
  -e POSTGRES_PASSWORD=wrapper123 \
  -e POSTGRES_DB=wrapper_db \
  -p 5432:5432 \
  postgres:16-alpine

# Verify it's running
podman ps
```

### 3. Backend Setup

```bash
cd back

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Edit .env and add your Resend API key
nano .env
```

Required environment variables in `.env`:
```env
DATABASE_URL=postgresql://wrapper:wrapper123@localhost:5432/wrapper_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RESEND_API_KEY=re_your_resend_api_key_here
PORT=3000
FROM_EMAIL=noreply@yourdomain.com
```

```bash
# Generate Prisma Client
bunx prisma generate

# Run database migrations
bunx prisma migrate dev --name init

# Run backend
bun run dev
```

Backend will start at `http://localhost:3000`

### 4. Frontend Setup

```bash
cd ../app

# Install dependencies
bun install

# Create .env file
cp .env.example .env
```

Environment variables in `.env`:
```env
PUBLIC_API_URL=http://localhost:3000
```

```bash
# Run frontend
bun run dev
```

Frontend will start at `http://localhost:4321`

## Usage

### 1. Create Account
- Go to `http://localhost:4321`
- Click "Get Started" or "Sign up"
- Register with email and password

### 2. Generate API Key
- After login, you'll be redirected to the dashboard
- Click "Generate New Key"
- Copy your API key (format: `wp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 3. Send Receipt Email

**Using cURL:**
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

**Using JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/api/send-receipt', {
  method: 'POST',
  headers: {
    'X-API-Key': 'wp_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    item: 'Laptop',
    harga: '5000000',
    email: 'customer@example.com'
  })
});

const data = await response.json();
console.log(data);
```

### 4. View Request History
- Check the dashboard to see all API requests
- Each log shows status, endpoint, timestamp, and masked API key

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### API Keys (Requires JWT)
- `POST /api-keys/generate` - Generate new API key
- `GET /api-keys/list` - List all API keys
- `PATCH /api-keys/revoke/:id` - Revoke API key

### Email (Requires API Key)
- `POST /api/send-receipt` - Send receipt email

### Logs (Requires JWT)
- `GET /logs` - Get request history

### Documentation
- `GET /swagger` - Interactive API documentation

## Project Structure

```
wrapper/
├── back/                    # Backend (Elysia.js)
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── config/         # Database & environment config
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── templates/      # Email templates
│   │   ├── utils/          # Utilities (API key generation)
│   │   └── index.ts        # Main server file
│   ├── .env.example
│   └── package.json
│
└── app/                     # Frontend (Astro)
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── layouts/        # Page layouts
    │   ├── pages/          # Routes (index, login, dashboard, docs)
    │   └── styles/         # Global CSS
    ├── .env.example
    └── package.json
```

## Development Notes

- Backend runs on port `3000`
- Frontend runs on port `4321`
- PostgreSQL runs on port `5432`
- Database uses **Prisma ORM** for type-safe queries
- API keys have format: `wp_` + 32 random characters
- Passwords are hashed with bcrypt
- JWT tokens expire in 7 days
- All request logs are saved to database
- Use `bunx prisma studio` to view database in GUI

## Stopping Services

```bash
# Stop backend & frontend
# Press Ctrl+C in their respective terminals

# Stop PostgreSQL container
podman stop postgres-wrapper

# Remove container (optional)
podman rm postgres-wrapper
```

## License

MIT
