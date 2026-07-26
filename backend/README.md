# SNT Backend

Node.js / Express / TypeScript REST API for SNT Live Events.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 4
- **Database**: PostgreSQL via Prisma ORM
- **File uploads**: Local disk storage (multer) — served as static files at `/uploads/*`
- **Auth**: JWT in httpOnly cookie (+ Bearer header fallback)

---

## Running with Docker (recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)

### 1. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

| Variable | Required | Notes |
|---|---|---|
| `JWT_SECRET` | ✅ | Generate with `openssl rand -base64 64` |
| `FRONTEND_URL` | ✅ | e.g. `http://localhost:3333` — no trailing slash |
| `POSTGRES_PASSWORD` | ✅ | Any strong password for the Docker postgres container |
| `POSTGRES_USER` | optional | Defaults to `snt` |
| `POSTGRES_DB` | optional | Defaults to `snt_events` |
| `PORT` | optional | Defaults to `4000` |

> `DATABASE_URL` in `.env` is **overridden** by `docker-compose.yml` to point at
> the `postgres` container — you do not need to change it for Docker use.

### 2. Build and start

```bash
docker compose up --build
```

On first run this will:

1. Pull the `postgres:16-alpine` image
2. Build the backend image (installs deps, generates Prisma client, compiles TypeScript)
3. Start PostgreSQL and wait for it to be healthy
4. Run `prisma migrate deploy` (applies all migrations)
5. Start the Express server on port 4000

### 3. Seed the database (first run only)

```bash
docker compose exec backend npx ts-node --transpile-only prisma/seed.ts
```

This creates the admin user, default settings, and sample events.

### 4. Stop

```bash
docker compose down        # stops containers, keeps volumes
docker compose down -v     # stops containers AND deletes all volumes (data loss!)
```

### Upload persistence across restarts

Uploaded files (event photos, flyers, hero videos) are stored in a **named Docker
volume** (`uploads`) mounted at `/app/dist/uploads` inside the container.

```
volume: uploads  →  /app/dist/uploads
                       ├── events/
                       ├── flyers/
                       └── hero/
```

After `docker compose down` + `docker compose up`, the volume is reattached and
all previously uploaded files are still present and still served at
`http://localhost:4000/uploads/...`.

After `docker compose up --build` (image rebuild), the same volume is remounted —
uploaded files are unaffected because they live in the volume, not the image.

Only `docker compose down -v` destroys the volume and its contents.

### Why `/app/dist/uploads`?

The TypeScript `tsconfig.json` sets `rootDir: "."`, so the compiled output
structure is `dist/src/…` (not `dist/…`). At runtime `__dirname` inside
`dist/src/app.js` is `/app/dist/src`, and:

```
path.join(__dirname, '../uploads')   →  /app/dist/uploads   (static serving)
path.join(__dirname, '../../../uploads/events')  →  /app/dist/uploads/events  (multer)
```

All upload paths consistently resolve inside `/app/dist/uploads`, so a single
volume mount at that path covers everything.

---

## Running locally (without Docker)

### Prerequisites

- Node 20+
- PostgreSQL running locally

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL to your local postgres, JWT_SECRET, FRONTEND_URL
```

### 3. Database

```bash
npm run db:migrate   # run pending migrations
npm run db:generate  # regenerate Prisma client (after schema changes)
npm run db:seed      # seed admin user, settings, sample events
```

### 4. Run

```bash
npm run dev    # development with hot reload (ts-node-dev)
npm run build  # compile TypeScript → dist/
node dist/src/index.js  # run compiled output (note: dist/src/, not dist/)
```

> **Note:** `package.json` `"start"` script currently points to `dist/index.js`
> which is incorrect given `rootDir: "."` in tsconfig. Use
> `node dist/src/index.js` directly.

---

## API routes

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/events` | List all events (filter by `?status=upcoming\|past`) |
| GET | `/api/events/:slug` | Single event with media |
| GET | `/api/settings` | Bank/payment settings |
| GET | `/api/hero-videos` | Hero video slots |
| POST | `/api/ticket-requests` | Submit ticket request (multipart) |

**Ticket request form fields:**

| Field | Type |
|---|---|
| `eventId` | string (CUID) |
| `phaseId` | string (CUID) |
| `email` | string |
| `paymentSlip` | file (JPG / PNG / PDF, max 5 MB) |

### Admin (all require auth cookie or Bearer token)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | Login → sets httpOnly cookie |
| POST | `/api/admin/auth/logout` | Clear cookie |
| GET | `/api/admin/auth/me` | Current admin info |
| GET/POST | `/api/admin/events` | List / create events |
| GET/PATCH/DELETE | `/api/admin/events/:id` | Single event |
| GET/PUT | `/api/admin/events/:eventId/artists` | List / replace artists |
| GET/POST | `/api/admin/events/:eventId/phases` | List / add phases |
| PATCH/DELETE | `/api/admin/events/:eventId/phases/:phaseId` | Update / delete phase |
| GET/POST | `/api/admin/events/:eventId/media` | List / upload photos |
| PATCH | `/api/admin/events/:eventId/media/reorder` | Reorder media |
| DELETE | `/api/admin/events/:eventId/media/:mediaId` | Delete media item |
| GET/PATCH | `/api/admin/hero-videos` | Hero video slots |
| DELETE | `/api/admin/hero-videos/:slotNumber` | Clear a slot |
| GET | `/api/admin/ticket-requests` | List (filterable by `eventId`, `status`) |
| GET | `/api/admin/ticket-requests/:id` | Single request |
| PATCH | `/api/admin/ticket-requests/:id/status` | Confirm or reject |
| GET | `/api/admin/settings` | Current settings |
| PUT | `/api/admin/settings/:key` | Update a setting |

---

## Rate limits

- **Ticket requests**: 5 per IP per hour + 3 per email per hour
- **Admin login**: 5 per IP per 15 minutes

## Security notes

- File uploads proxied through the server — type and size validated before saving
- CORS restricted to `FRONTEND_URL` env var
- Helmet sets secure HTTP headers
- Passwords bcrypt-hashed (salt rounds 12)
- JWT stored in httpOnly cookie; stack traces never sent in production responses
- Only seeded setting keys editable via API (prevents schema sprawl)

## Phase 2 notes

The `TicketRequest` model already has `paymentGatewayReference` and
`paymentGatewayStatus` columns reserved for an online payment gateway integration.
No email notifications are sent — deferred to Phase 2.

---

## Database operations

### First deployment: seeding the database on the Droplet

When you deploy for the first time, the postgres container starts with an empty
database. `prisma migrate deploy` (run automatically by the backend's CMD) creates
the schema, but you still need to populate the data.

**Option A — Carry your local dev data across (recommended)**

Run this on your local Mac before deploying, to export everything from your local
postgres into a dump file:

```bash
# From the backend directory on your Mac
pg_dump "postgresql://dilshan@localhost:5432/snt_events" \
  --no-owner --no-acl \
  -f local_export.sql
```

Then, on the Droplet after `docker compose up -d postgres` is healthy:

```bash
cat local_export.sql | docker compose exec -T postgres \
  psql -U snt -d snt_events
```

**Option B — Fresh start with seed data**

If you'd rather start clean on the Droplet:

```bash
docker compose exec backend npx ts-node --transpile-only prisma/seed.ts
```

**Verify data is present after either option:**

```bash
docker compose exec postgres psql -U snt -d snt_events -c \
  "SELECT id, title, status FROM \"Event\" ORDER BY \"eventDate\";"
```

**Apply any pending Prisma migrations (safe to run even if schema is in sync):**

```bash
docker compose run --rm backend npx prisma migrate deploy
```

---

### Automated backups

The script `scripts/backup-postgres.sh` dumps the database to `./backups/` on the host filesystem (outside the Docker volume) and deletes files older than 14 days.

**Set up the daily cron on the server** (as the deploy user, once deployed):

```bash
crontab -e
```

Add this line (adjust the path to wherever you cloned the repo):

```
0 3 * * * cd /opt/snt/backend && ./scripts/backup-postgres.sh >> /var/log/snt-backup.log 2>&1
```

This runs at 03:00 UTC every day. Check `/var/log/snt-backup.log` to confirm it's running.

**Run a manual backup at any time:**

```bash
cd /opt/snt/backend && ./scripts/backup-postgres.sh
```

Backup files are saved to `./backups/snt_events_YYYYMMDD_HHMMSS.sql`.

---

### Restoring from a backup file

```bash
# Pick a backup file
ls -lh backups/

# Restore (this REPLACES all current data — be sure this is what you want)
cat backups/snt_events_20260101_030000.sql | docker compose exec -T postgres \
  psql -U snt -d snt_events

# Re-apply migrations to ensure schema is in sync
docker compose run --rm backend npx prisma migrate deploy
```

---

### Verifying database health

```bash
# Check postgres container is healthy
docker compose ps postgres

# Quick connectivity test
docker compose exec postgres pg_isready -U snt -d snt_events

# Count rows in key tables
docker compose exec postgres psql -U snt -d snt_events -c \
  "SELECT 'Event' AS tbl, count(*) FROM \"Event\"
   UNION ALL SELECT 'Admin', count(*) FROM \"Admin\"
   UNION ALL SELECT 'TicketRequest', count(*) FROM \"TicketRequest\";"
```

---

### ⚠ Volume warning

The `postgres_data` named volume is the **sole persistent store** for all event data, admin accounts, ticket requests, and settings.

- `docker compose down` — safe: stops containers, volume is preserved.
- `docker compose down -v` — **DESTRUCTIVE**: deletes the volume and all data. Never run this in production without a verified backup.

Before any redeployment that touches the Docker volumes, run `scripts/backup-postgres.sh` manually and confirm the file exists and is non-empty.
