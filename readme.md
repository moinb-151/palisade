# Palisade 🛡️

**Palisade** is an enterprise-grade, highly secure Role-Based Access Control (RBAC) backend system. Built from the ground up with Node.js, Fastify, Prisma, and Redis using plain JavaScript, it demonstrates production-ready identity management, dynamic permissions, and bulletproof session security.

## ✨ Core Features

- **Dynamic RBAC Engine**: Create infinite custom roles and permissions. Assign granular capabilities dynamically via the database without changing application code.
- **Strict Token Rotation**: Combines the stateless speed of JWTs with the stateful security of a Redis cache. Refresh tokens are strictly rotated and verified on every use to prevent session hijacking.
- **XSS-Proof Sessions**: Authentication is handled exclusively via secure `HttpOnly` cookies, making tokens invisible to malicious frontend JavaScript.
- **Global Data Validation**: Utilizes Zod schemas to intercept and sanitize bad request data before it ever hits the business logic.
- **Custom Gatekeepers**: Features modular Fastify hooks (`The Bouncer` for Authentication, `The Vault Guard` for Authorization) that protect endpoints dynamically.
- **Idempotent Database Seeding**: Safely boot and reboot the default Super Admin and standard User hierarchies.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v22+) |
| Framework | Fastify |
| Database ORM | Prisma |
| Cache / Session Store | Redis |
| Validation | Zod |
| Password Hashing | Bcrypt |
| Auth Tokens | JSON Web Tokens (JWT) |
| Execution | `node --watch` (or `nodemon`) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v22.13.1 or higher recommended)
- [`pnpm`](https://pnpm.io/) (or npm/yarn)
- A running instance of **PostgreSQL**
- A running instance of **Redis**

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/yourusername/palisade.git
cd palisade
```

**2. Install dependencies:**

```bash
pnpm install
```

**3. Set up environment variables:**

Create a `.env` file in the root directory and provide your own connection strings and secure secrets:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/palisade"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="your_super_secret_access_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
```

**4. Initialize the database:**

Push the schema to your PostgreSQL database and generate the Prisma Client:

```bash
pnpm prisma db push
pnpm prisma generate
```

**5. Seed the database:**

Populate default permissions and roles (e.g. `SUPER_ADMIN` and `USER`):

```bash
pnpm prisma db seed
```

**6. Start the development server:**

```bash
pnpm dev
```

The server will now be running locally. 🎉

---

## 🔐 Security Architecture

### Token Strategy

Palisade uses a dual-token approach:

- **Access Token (JWT)**: Short-lived, stateless. Validated on every protected request.
- **Refresh Token**: Long-lived, stored in Redis. Strictly rotated on each use — a reused refresh token immediately invalidates the entire session, cutting off hijackers.

### Session Delivery

All tokens are delivered exclusively via `HttpOnly`, `Secure`, `SameSite` cookies. They are never exposed to JavaScript, which eliminates the XSS attack surface entirely.

### RBAC Flow

```
Request → The Bouncer (AuthN) → The Vault Guard (AuthZ) → Route Handler
```

1. **The Bouncer** verifies the access token and attaches the user identity to the request.
2. **The Vault Guard** checks that the user's role holds the required permission for the target endpoint.
3. If either check fails, the request is rejected before any business logic executes.

---

## 📁 Project Structure

```
palisade/
├
settings (formatting, linting)
├─ prisma/
│  ├─ migrations/                      # Auto-generated migration history
│  │  ├─ 20260411062824_init/
│  │  │  └─ migration.sql             # Initial schema — users, roles, permissions tables
│  │  ├─ 20260411140713_add_password_hash/
│  │  │  └─ migration.sql             # Adds passwordHash field to users
│  │  ├─ 20260425144950_add_is_banned_field/
│  │  │  └─ migration.sql             # Adds isBanned flag for user suspension
│  │  └─ migration_lock.toml          # Locks migration provider (do not edit manually)
│  ├─ schema.prisma                   # Database schema — models, relations, enums
│  └─ seed.js                         # Idempotent seeder for default roles & permissions
├─ src/
│  ├─ config/
│  │  ├─ env.js                       # Loads & validates environment variables
│  │  └─ redis.js                     # Redis client instance & connection setup
│  ├─ modules/
│  │  └─ users/                       # Self-contained user feature module
│  │     ├─ users.controller.js       # Request handlers — calls service, sends response
│  │     ├─ users.routes.js           # Route definitions & hook registrations
│  │     ├─ users.schema.js           # Zod schemas for request/response validation
│  │     └─ users.service.js          # Business logic — DB queries via Prisma
│  ├─ plugins/
│  │  ├─ auth.js                      # The Bouncer — JWT verification & session auth hook
│  │  ├─ permissions.js               # The Vault Guard — RBAC authorization hook
│  │  └─ prisma.js                    # Prisma plugin — decorates Fastify with db client
│  ├─ utils/
│  │  └─ jwt.js                       # JWT sign & verify helpers (access + refresh tokens)
│  ├─ app.js                          # Fastify instance setup — registers plugins & routes
│  └─ server.js                       # Entry point — starts the HTTP server
├─ .env                               # Local environment variables (do not commit)
├─ .gitignore                         # Files & directories excluded from version control
├─ package.json                       # Project metadata, scripts & dependencies
├─ pnpm-lock.yaml                     # Lockfile — ensures reproducible installs
├─ prisma.config.ts                   # Prisma CLI configuration (seed path, etc.)
└─ readme.md                          # You are here

```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the development server with `node --watch` |
| `pnpm start` | Run the server in production |
| `pnpm prisma db push` | Sync schema to the database |
| `pnpm prisma generate` | Regenerate the Prisma Client |
| `pnpm prisma db seed` | Seed default roles and permissions |
| `pnpm prisma studio` | Open the Prisma visual database browser |

---