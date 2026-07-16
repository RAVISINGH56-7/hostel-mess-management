# Hostel Mess Management System

A Next.js 15 application for managing hostel mess operations — student QR passes, meal scanning, warden management, and analytics.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: NextAuth v5 (Auth.js) — JWT strategy with CredentialsProvider
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS v4
- **QR**: `qrcode.react` + `html5-qrcode`

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for NextAuth session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public base URL — `http://localhost:3000` in dev |
| `QR_SECRET` | Secret for signing student QR tokens |
| `RESET_TOKEN_SECRET` | Secret for signing password-reset tokens |

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Default Credentials (after seeding)

### Admin
| Field | Value |
|---|---|
| Portal | `/login/staff-admin` → select **Admin** |
| Email | `admin@tiffin.edu` |
| Password | `admin123` |

### Warden
Wardens are created by the Admin in `/dashboard/admin/wardens`. They log in at `/login/staff-admin` → select **Warden** with the email and password set during creation.

### Staff (scanner)
Staff are created by the Admin in `/dashboard/admin/staff`. They log in at `/login/staff`.

### Student
Students are registered by a Warden in `/dashboard/warden/students/new`.

| Field | Value |
|---|---|
| Portal | `/login/student` |
| Roll Number | The roll number entered during registration |
| Default Password | Last 4 digits of roll number + `_pass` |

**Example**: roll number `27600122064` → password `2064_pass`

Students should change their password after first login.

---

## Portal URLs

| Portal | URL |
|---|---|
| Home / landing | `/` |
| Admin & Warden login | `/login/staff-admin` |
| Staff scanner login | `/login/staff` |
| Student login | `/login/student` |
| Admin dashboard | `/dashboard/admin` |
| Warden dashboard | `/dashboard/warden` |
| Student dashboard | `/dashboard/student` |
| Meal scanner | `/scanner` |

---

## Common Issues

**Can't sign in even with correct credentials**
- Make sure `NEXTAUTH_URL` matches the URL you're visiting (including `http://` vs `https://`).
- Run `npm run dev` (not `--experimental-https`) in development. HTTPS in dev causes cookie issues.
- After seeding, verify the admin user exists: `npx prisma studio`.

**"Warden not assigned to a block" error**
- Go to Admin → Wardens and ensure the warden has a block assigned.

**QR code not scanning**
- `QR_SECRET` must be the same value that was set when the student was created. If you change it, existing QR tokens become invalid.

---

## Seeding

The seed script (`prisma/seed.ts`) creates:
- One hostel ("Main Hostel") with one block ("Block A")
- A `SUPER_ADMIN` user: `admin@tiffin.edu` / `admin123`
- Default meal windows (Breakfast, Lunch, Snacks, Dinner)

Run it with:
```bash
npm run db:seed
```
