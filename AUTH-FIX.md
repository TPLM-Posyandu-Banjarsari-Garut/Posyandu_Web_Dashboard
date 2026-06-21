# Implementation Plan — Auth Fix & Optimization

Dokumen ini mencatat semua bug yang ditemukan beserta rencana perbaikan dan optimasi logic untuk sistem autentikasi.

---

## Ringkasan Masalah

| # | Masalah | Dampak | File |
|---|---------|--------|------|
| 1 | `proxy.ts` tidak dieksekusi Next.js | Middleware tidak pernah jalan, redirect tidak bekerja | `proxy.ts` |
| 2 | `SESSION_COOKIE_NAME` tidak cocok dengan nama cookie di browser | Cookie tidak terbaca, session selalu null | `constants.ts` |
| 3 | Login langsung ke backend — cookie di-set domain yang salah | Middleware tidak bisa baca cookie, redirect gagal | `hooks/use-auth.ts` |
| 4 | `useLogin` mencoba baca `set-cookie` header dari browser | Selalu `null` karena diblokir CORS | `hooks/use-auth.ts` |
| 5 | `useSession` duplikasi validasi role yang sudah ditangani middleware | Logic redundant | `hooks/use-auth.ts` |
| 6 | Redis cache tidak di-invalidate saat logout | Session lama masih valid hingga 5 menit setelah logout | `hooks/use-auth.ts` |
| 7 | `ALLOWED_ROLES_ARRAY` tidak terpakai | Dead code | `constants.ts` |
| 8 | `NEXT_PUBLIC_API_URL` ter-bundle ke client | URL backend terekspos di browser | `constants.ts` |

---

## Fase 1 — Bug Kritis (Kerjakan Dulu)

> Tiga masalah ini yang menyebabkan redirect sama sekali tidak bekerja.

### Tugas 1.1 — Rename `proxy.ts` → `middleware.ts`

**File:** `proxy.ts` (root) → `middleware.ts` (root)

Next.js hanya menjalankan file bernama `middleware.ts` di root project dengan export bernama `middleware`. Nama lain tidak akan dieksekusi.

**Perubahan:**
- Rename file dari `proxy.ts` ke `middleware.ts`
- Ubah nama fungsi dari `proxy` ke `middleware`
- Hapus guard `if (pathname !== '/' && !pathname.startsWith('/dashboard'))` — sudah ditangani oleh `matcher` di `config`, tidak perlu dicek dua kali

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
    // ... isi sama, hanya nama fungsi yang berubah
}

export const config = {
    matcher: ['/', '/dashboard/:path*']
}
```

---

### Tugas 1.2 — Fix `SESSION_COOKIE_NAME`

**File:** `constants.ts`

Browser menyimpan cookie dengan nama `__Secure-better-auth.session_token` (ada prefix `__Secure-`) saat app berjalan di HTTPS. Better-auth menambahkan prefix ini otomatis di production. Konstanta yang ada `better-auth.session_token` tidak cocok sehingga `req.cookies.get(SESSION_COOKIE_NAME)` selalu `undefined`.

**Perubahan:**

```typescript
// constants.ts
export const SESSION_COOKIE_NAME =
    process.env.NODE_ENV === 'production'
        ? '__Secure-better-auth.session_token'
        : 'better-auth.session_token'
```

---

### Tugas 1.3 — Buat API Route Proxy untuk Login

**File baru:** `app/api/auth/login/route.ts`

**Masalah:** `useLogin` fetch langsung ke `api.posyandu.com`. Browser menerima `Set-Cookie` dari backend dan menyimpan cookie di bawah domain `api.posyandu.com`. Middleware berjalan di `posyandu.com` — browser tidak mengirim cookie domain lain, sehingga `req.cookies.get(SESSION_COOKIE_NAME)` selalu kosong.

**Solusi:** Buat API route di Next.js sebagai perantara. Next.js fetch ke backend di sisi server (tidak ada batasan CORS), lalu me-relay header `Set-Cookie` ke browser dengan domain frontend.

```typescript
// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { ALLOWED_ROLES, BACKEND_URL } from '@/constants/constants'

export async function POST(req: NextRequest) {
    const body = await req.json()

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
        return NextResponse.json(
            { message: data?.message || 'Incorrect email or password.' },
            { status: backendRes.status }
        )
    }

    if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
        // Sign-out di backend sisi server — tidak ada masalah CORS
        await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
            method: 'POST',
            headers: {
                Cookie: backendRes.headers.get('set-cookie') || ''
            }
        }).catch(() => {})

        return NextResponse.json({ message: 'UNAUTHORIZED_ROLE' }, { status: 403 })
    }

    // Relay semua Set-Cookie dari backend ke browser
    const res = NextResponse.json(data, { status: 200 })
    backendRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
            res.headers.append('set-cookie', value)
        }
    })

    return res
}
```

Update `useLogin` agar hit ke route ini:

```typescript
// hooks/use-auth.ts — bagian useLogin
mutationFn: async (credentials: LoginInput) => {
    const response = await fetch('/api/auth/login', { // ← Next.js API route, bukan backend langsung
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.message || 'Incorrect email or password.')
    }

    return data
}
```

---

## Fase 2 — Optimasi Logic

> Dikerjakan setelah Fase 1 selesai dan redirect sudah berjalan.

### Tugas 2.1 — Buat `serverFetch` Helper

**File baru:** `lib/server-fetch.ts`

Helper untuk Server Components dan Route Handlers agar tidak perlu manually forward cookie setiap kali fetch ke backend.

```typescript
// lib/server-fetch.ts
import { cookies } from 'next/headers'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'

export async function serverFetch(path: string, init?: RequestInit) {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    return fetch(`${BACKEND_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(sessionToken && {
                Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
            }),
            ...init?.headers
        },
        cache: 'no-store'
    })
}
```

**Cara pakai di Server Component:**

```typescript
// app/dashboard/page.tsx
import { serverFetch } from '@/lib/server-fetch'

export default async function DashboardPage() {
    const res = await serverFetch('/api/posyandu/list')
    const data = await res.json()
    // ...
}
```

**Catatan:** Untuk Client Component, tetap pakai `credentials: 'include'` dan fetch langsung ke backend — cookie sudah tersimpan di domain yang benar setelah login via proxy route.

---

### Tugas 2.2 — Hapus Logika Sign-out di `useLogin`

**File:** `hooks/use-auth.ts`

Kode saat ini di `useLogin` mencoba manual sign-out ke backend saat role tidak diizinkan, dengan meneruskan `Cookie` header dari response. Browser memblokir akses ke `set-cookie` response header dari JavaScript (CORS restriction) — `response.headers.get('set-cookie')` selalu `null`.

Logika ini sudah dipindahkan ke API route login (Tugas 1.3) yang berjalan di sisi server. Hapus seluruh blok berikut dari `useLogin`:

```typescript
// HAPUS blok ini dari useLogin
const sessionToken = data?.token
const cookiesHeader = response.headers.get('set-cookie') // selalu null

await fetch(`/api/auth/sign-out`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        Cookie: cookiesHeader || ''
    }
}).catch(err =>
    console.error('Signout failed for unauthorized user:', err)
)
```

---

### Tugas 2.3 — Sederhanakan `useSession`

**File:** `hooks/use-auth.ts`

`useSession` saat ini mengecek `ALLOWED_ROLES.has(data.user.role)` di sisi client. Pengecekan ini redundant — middleware sudah memblokir akses ke halaman dashboard jika role tidak valid. `useSession` cukup return data dari backend.

**Sebelum:**

```typescript
const data = await response.json()
if (!data?.user || !ALLOWED_ROLES.has(data.user.role)) {
    return null
}
return data
```

**Sesudah:**

```typescript
const data = await response.json()
if (!data?.user) return null
return data
```

---

### Tugas 2.4 — Invalidate Redis Cache Saat Logout

**File baru:** `app/api/auth/logout/route.ts`

Saat ini saat user logout, cache Redis `dashboard:session:{token}` masih hidup hingga 5 menit. Artinya jika token dicuri, sesi masih valid selama window tersebut. Buat proxy route untuk logout yang menghapus cache terlebih dahulu.

```typescript
// app/api/auth/logout/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL, SESSION_COOKIE_NAME } from '@/constants/constants'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value

    // Hapus cache Redis lebih dulu
    if (sessionToken && redis) {
        const redisKey = `dashboard:session:${sessionToken}`
        await redis.del(redisKey).catch(err =>
            console.error('Redis cache delete error:', err)
        )
    }

    // Forward ke backend
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`
        }
    })

    if (!backendRes.ok) {
        return NextResponse.json({ message: 'Logout failed.' }, { status: 500 })
    }

    // Hapus cookie di browser
    const res = NextResponse.json({ success: true })
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
}
```

Update `useLogout` untuk hit route ini:

```typescript
// hooks/use-auth.ts — bagian useLogout
mutationFn: async () => {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to log out.')
    return true
}
```

---

## Fase 3 — Cleanup

> Bisa dikerjakan paralel dengan Fase 2.

### Tugas 3.1 — Hapus `ALLOWED_ROLES_ARRAY`

**File:** `constants.ts`

`ALLOWED_ROLES_ARRAY` tidak digunakan di mana pun dalam codebase. Sudah ada `ALLOWED_ROLES` bertipe `Set` yang lebih efisien untuk lookup (`O(1)` vs `O(n)`).

```typescript
// HAPUS baris ini
export const ALLOWED_ROLES_ARRAY = ['posyandu_admin', 'village_admin']
```

---

### Tugas 3.2 — Pisahkan `BACKEND_URL` untuk Server dan Client

**File:** `constants.ts`, `.env`

Variabel dengan prefix `NEXT_PUBLIC_` otomatis di-bundle ke client-side JavaScript dan bisa dilihat siapa pun yang inspect bundle. Jika `BACKEND_URL` hanya dipakai di server (middleware, server fetch, API routes), tidak perlu di-expose ke client.

**`.env` sebelum:**
```
NEXT_PUBLIC_API_URL=https://api.posyandu.com
```

**`.env` sesudah:**
```
# Untuk server-side saja (middleware, server components, API routes)
API_URL=https://api.posyandu.com

# Jika ada kebutuhan client-side, pisahkan
NEXT_PUBLIC_API_URL=https://api.posyandu.com
```

**`constants.ts` sesudah:**
```typescript
// Untuk server-side usage (middleware, serverFetch, API routes)
export const BACKEND_URL = process.env.API_URL

// Hanya jika benar-benar butuh di client component
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
```

> **Catatan:** Jika `useSession` dan hook lain di client component masih perlu URL backend langsung (fetch dengan `credentials: 'include'`), tetap pakai `NEXT_PUBLIC_API_URL`. Yang penting, tidak gunakan satu variabel untuk keduanya.

---

## Checklist

### Fase 1 — Bug Kritis
- [ ] Rename `proxy.ts` → `middleware.ts`, rename fungsi `proxy` → `middleware`
- [ ] Fix `SESSION_COOKIE_NAME` di `constants.ts` sesuai environment
- [ ] Buat `app/api/auth/login/route.ts` dan update `useLogin`

### Fase 2 — Optimasi Logic
- [ ] Buat `lib/server-fetch.ts`
- [ ] Hapus logika sign-out manual di `useLogin`
- [ ] Sederhanakan `useSession` — hapus pengecekan role
- [ ] Buat `app/api/auth/logout/route.ts` dan update `useLogout`

### Fase 3 — Cleanup
- [ ] Hapus `ALLOWED_ROLES_ARRAY` dari `constants.ts`
- [ ] Pisahkan env var `API_URL` (server) dan `NEXT_PUBLIC_API_URL` (client)

---

## Struktur File Setelah Semua Perubahan

```
├── middleware.ts                        ← rename dari proxy.ts
├── constants/
│   └── constants.ts                    ← fix SESSION_COOKIE_NAME, hapus ALLOWED_ROLES_ARRAY
├── lib/
│   ├── redis.ts                        ← tidak berubah
│   └── server-fetch.ts                 ← baru
├── app/
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts            ← baru
│           └── logout/
│               └── route.ts            ← baru
└── hooks/
    └── use-auth.ts                     ← update useLogin, useLogout, useSession
```