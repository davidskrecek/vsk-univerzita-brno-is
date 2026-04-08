# VSK Univerzita Brno IS

## Setup

### 1. Start the database

```bash
cd db
docker compose up -d
```

### 2. Configure environment

create .env file in project root with following variables with docker compose defaults:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/default_database"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```


### 3. Install dependencies

```bash
npm install
```

### 4. Run migrations and seed

```bash
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts
```

The seed creates:
- Roles: `superadmin`, `sport_manager`, `viewer`
- Sports: Atletika, Tenis
- Admin account: `admin@vsk.cz` / `Admin1234!`
- Trainer account: `trener.atletika@vsk.cz` / `Trener1234!`
- Sample posts and events

### 5. Start dev server

```bash
npm run dev
```

---

## API

See [BACKEND_API.md](./BACKEND_API.md) for the full API contract.

## Project structure

```
src/
  app/
    api/
      auth/[...nextauth]/   # NextAuth handler
      auth/invitation/      # Invitation accept
      sports/               # GET /api/sports
      posts/                # GET /api/posts, GET /api/posts/:id
      events/               # GET /api/events, GET /api/events/:id
      contacts/             # GET /api/contacts
      partner-orders/       # POST (public), GET + PATCH (admin)
      admin/
        posts/              # POST, PATCH
        events/             # POST, PATCH
        users/              # POST, GET /stats
        sports/             # POST
  lib/
    prisma.ts     # DB client singleton
    auth.ts       # NextAuth options
    session.ts    # getRequiredSession helper
    rbac.ts       # requireRole / requireSportScope
    api.ts        # ok() / apiError() helpers
  types/
    next-auth.d.ts  # Extended session types
prisma/
  schema.prisma
  seed.ts
  migrations/
```
