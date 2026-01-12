## 1. User Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Fill registration form<br/>(email, password)
    F->>B: POST /auth/register
    B->>B: Validate input
    B->>DB: Check if user exists
    DB-->>B: User not found
    B->>B: Hash password (bcrypt)
    B->>DB: Create user
    DB-->>B: User created
    B->>B: Generate JWT token
    B-->>F: Return token + user data
    F->>F: Store token in localStorage
    F-->>U: Redirect to dashboard
```

**Steps:**
1. User mengisi form registrasi dengan email dan password
2. Frontend mengirim POST request ke `/auth/register`
3. Backend validasi input dan cek apakah email sudah terdaftar
4. Password di-hash menggunakan bcrypt (10 rounds)
5. User baru dibuat di database
6. JWT token di-generate dengan payload `{ userId, email }`
7. Token dan data user dikembalikan ke frontend
8. Frontend menyimpan token dan redirect ke dashboard

## 2. User Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Enter credentials<br/>(email, password)
    F->>B: POST /auth/login
    B->>DB: Find user by email
    DB-->>B: User data
    B->>B: Compare password<br/>(bcrypt.compare)
    alt Password Valid
        B->>B: Generate JWT token
        B-->>F: Return token + user data
        F->>F: Store token
        F-->>U: Redirect to dashboard
    else Password Invalid
        B-->>F: 401 Unauthorized
        F-->>U: Show error message
    end
```

**Steps:**
1. User memasukkan email dan password
2. Frontend mengirim POST request ke `/auth/login`
3. Backend mencari user berdasarkan email
4. Password diverifikasi menggunakan `bcrypt.compare()`
5. Jika valid, JWT token di-generate
6. Token dikembalikan ke frontend
7. Frontend menyimpan token dan redirect ke dashboard
8. Jika invalid, error 401 dikembalikan

## 3. API Key Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Click "Generate API Key"
    F->>B: POST /keys<br/>Header: Bearer JWT
    B->>B: Verify JWT token
    B->>B: Extract userId from token
    B->>B: Generate random key<br/>(format: wp_xxxxx)
    B->>DB: Save API key
    DB-->>B: Key saved
    B-->>F: Return API key data
    F-->>U: Display key & copy button
    Note over U,F: User dapat copy key<br/>untuk digunakan di aplikasi
```

**Steps:**
1. User klik tombol "Generate API Key" di dashboard
2. Frontend mengirim POST request ke `/keys` dengan JWT token di header
3. Backend verifikasi JWT token dan extract userId
4. Random API key di-generate dengan format `wp_` + random string
5. API key disimpan di database dengan status `isActive: true`
6. API key dikembalikan ke frontend
7. Frontend menampilkan key dengan tombol copy

## 4. Email Sending Flow (Main Endpoint)

```mermaid
sequenceDiagram
    participant C as API Client
    participant B as Backend
    participant DB as Database
    participant R as Resend
    participant E as Email Recipient

    C->>B: POST /api/send-receipt<br/>Header: X-API-Key<br/>Body: {item, harga, email}
    B->>B: Validate API key format
    B->>DB: Check API key exists & active
    alt API Key Valid
        DB-->>B: API key data
        B->>B: Generate receipt HTML
        B->>R: Send email via Resend API
        R-->>E: Deliver email
        R-->>B: Email sent (ID)
        B->>DB: Log request (success)
        B-->>C: Return success + email ID
    else API Key Invalid
        DB-->>B: Key not found / inactive
        B->>DB: Log request (error)
        B-->>C: 401/403 Unauthorized
    end
```

**Steps:**
1. API client mengirim POST request dengan API key di header
2. Backend validasi format API key (harus diawali `wp_`)
3. Backend cek ke database apakah key exists dan active
4. Jika valid, HTML receipt di-generate dari template
5. Email dikirim via Resend API
6. Request di-log ke database (termasuk request & response data)
7. Success response dikembalikan dengan email ID
8. Jika key invalid, error 401/403 dikembalikan

## 5. Test Email Sending Flow (Auto-detect Sender)

```mermaid
sequenceDiagram
    participant C as API Client
    participant B as Backend
    participant DB as Database
    participant R as Resend
    participant E as Test Email

    C->>B: POST /api/send-test-receipt<br/>Header: X-API-Key<br/>Body: {item, harga}
    B->>B: Validate API key format
    B->>DB: Get API key with user data
    DB-->>B: API key + user.email
    B->>B: Set recipient to test email<br/>andhikahutama9@gmail.com
    B->>B: Generate receipt HTML<br/>with sender info
    B->>R: Send email via Resend API<br/>Subject includes sender email
    R-->>E: Deliver test email
    R-->>B: Email sent (ID)
    B->>DB: Log request with sender info
    B-->>C: Return success + sender + recipient
```

**Steps:**
1. API client mengirim POST request (tanpa field `email`)
2. Backend validasi API key dan retrieve user data dari database
3. Recipient email di-set ke hardcoded test email
4. Sender email di-ambil dari API key owner (`user.email`)
5. HTML receipt di-generate dengan info sender
6. Email subject include sender email
7. Email dikirim via Resend
8. Request di-log dengan info sender dan recipient
9. Response include sender & recipient info

## 6. Fetch API Keys Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Open dashboard
    F->>B: GET /keys<br/>Header: Bearer JWT
    B->>B: Verify JWT token
    B->>B: Extract userId
    B->>DB: Fetch all keys for user
    DB-->>B: List of API keys
    B-->>F: Return keys array
    F-->>U: Display keys in table<br/>(with status & created date)
```

**Steps:**
1. User membuka halaman dashboard
2. Frontend request GET `/keys` dengan JWT token
3. Backend verifikasi token dan extract userId
4. Semua API keys untuk user tersebut di-fetch dari database
5. List keys dikembalikan ke frontend
6. Frontend menampilkan keys dalam bentuk tabel

## 7. Revoke API Key Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Click "Revoke" button
    F->>F: Show confirmation dialog
    U->>F: Confirm revoke
    F->>B: DELETE /keys/:id<br/>Header: Bearer JWT
    B->>B: Verify JWT token
    B->>DB: Check key ownership
    alt User owns key
        DB-->>B: Key belongs to user
        B->>DB: Set isActive = false
        DB-->>B: Key revoked
        B-->>F: 200 Success
        F->>F: Remove key from list
        F-->>U: Show success message
    else User doesn't own key
        DB-->>B: Key not found / wrong user
        B-->>F: 404 Not Found
        F-->>U: Show error message
    end
```

**Steps:**
1. User klik tombol "Revoke" pada API key
2. Confirmation dialog muncul
3. Setelah konfirmasi, DELETE request dikirim ke `/keys/:id`
4. Backend verifikasi JWT dan cek ownership
5. Jika user adalah pemilik key, `isActive` di-set ke `false`
6. Success response dikembalikan
7. Frontend update UI dengan remove key dari list
8. Jika bukan pemilik, error 404 dikembalikan

## 8. Fetch Request Logs Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Open dashboard logs section
    F->>B: GET /logs<br/>Header: Bearer JWT
    B->>B: Verify JWT token
    B->>B: Extract userId
    B->>DB: Fetch logs for user's API keys<br/>(join with api_keys table)
    DB-->>B: List of logs
    B-->>F: Return logs array
    F-->>U: Display logs in table<br/>(endpoint, status, timestamp)
```

**Steps:**
1. User membuka section logs di dashboard
2. Frontend request GET `/logs` dengan JWT token
3. Backend verifikasi token dan extract userId
4. Logs di-fetch dengan JOIN ke table `api_keys` untuk filter by userId
5. Logs diurutkan berdasarkan timestamp (descending)
6. List logs dikembalikan ke frontend
7. Frontend menampilkan dalam bentuk tabel dengan detail request/response

---

*Generated: 2026-01-12*  
*Tech Stack: Astro + Elysia.js + Prisma + PostgreSQL + Resend*
