# Local Development Environment Setup

This guide walks through setting up the WinMix TipsterHub local development environment using Docker and scripted automation.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Docker Desktop** (includes Docker Engine and Docker Compose)
  - [Windows/Mac](https://www.docker.com/products/docker-desktop)
  - [Linux](https://docs.docker.com/engine/install/): `apt-get install docker.io docker-compose` or similar
  
- **Node.js 18+** and **npm**
  - Download from [nodejs.org](https://nodejs.org)
  - Verify: `node --version && npm --version`

- **Git** (for cloning and version control)
  - [Install Git](https://git-scm.com/downloads)

**Optional but recommended:**

- **netcat** (`nc`): Used by health check scripts
  - macOS: `brew install netcat`
  - Ubuntu/Debian: `apt-get install netcat-openbsd`
  - Windows: Built-in (via `Test-NetConnection` in PowerShell)

- **psql** (PostgreSQL client): For direct database queries
  - macOS: `brew install postgresql`
  - Ubuntu/Debian: `apt-get install postgresql-client`
  - Windows: [PostgreSQL installer](https://www.postgresql.org/download/windows/)

- **Supabase CLI** (for running edge functions locally)
  - [Installation guide](https://supabase.com/docs/guides/local-development#install-the-supabase-cli)
  - `npm install -g @supabase/cli`

## 🚀 Quick Start (Automated)

### Using the Bootstrap Script

The fastest way to get started is to use the automated bootstrap script:

```bash
# Make the script executable (Linux/macOS)
chmod +x scripts/dev/bootstrap.sh

# Run the bootstrap script
scripts/dev/bootstrap.sh

# On Windows (PowerShell)
# Note: Bootstrap script is bash, use Docker Desktop with WSL2 or run manually below
```

This script will:

1. ✓ Check all prerequisites
2. ✓ Create environment files (`.env.local`, `docker/.env`)
3. ✓ Install npm dependencies
4. ✓ Start Docker containers (Postgres, Supabase, pgAdmin)
5. ✓ Wait for services to be healthy
6. ✓ Run database seed scripts
7. ✓ Start the Vite development server

You should see output like:

```
✓ Docker installed
✓ Docker Compose installed
✓ Node.js installed
✓ npm installed
✓ Dependencies installed
✓ Docker services started
✓ Postgres is responding
✓ Supabase is responding
✓ Database seeded

========================================
✓ WinMix TipsterHub local development environment is ready!
========================================

📍 Service URLs:
  Frontend:     http://localhost:8080 (or http://localhost:5173)
  Supabase:     http://localhost:54321
  Postgres:     localhost:5432
  pgAdmin:      http://localhost:5050
```

## 🛠️ Manual Setup (Step-by-Step)

If the bootstrap script doesn't work or you prefer manual setup:

### Step 1: Prepare Environment Files

Copy the environment templates:

```bash
# Copy frontend environment template
cp .env.local.template .env.local

# Copy Docker environment template
cp docker/.env.example docker/.env
```

Edit `.env.local` and update any values as needed (usually defaults work for local dev):

```env
# For local development, use localhost
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Docker Services

```bash
# Start all services in the background
docker-compose up -d

# Or start with logs visible (great for debugging):
docker-compose up

# Verify containers are running
docker-compose ps
```

Expected output:

```
NAME                IMAGE                              STATUS
winmix-postgres     postgres:16-alpine                 Up 30s (healthy)
winmix-supabase     supabase/supabase:latest           Up 25s (healthy)
winmix-pgadmin      dpage/pgadmin4:latest              Up 20s
```

### Step 4: Run Database Migrations and Seeds

```bash
# Seed the database with initial data
node scripts/seed-database.mjs

# Check that tables were created
npm run seed:database

# Or directly with psql
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "\dt"
```

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:

```
VITE v5.x.x  ready in 200 ms

➜  Local:   http://localhost:8080/
➜  press h to show help
```

Open http://localhost:8080 in your browser.

## 📡 Service Endpoints

| Service | URL | Port |
| --- | --- | --- |
| Vite (Frontend) | http://localhost:8080 | 8080 |
| Vite (Default) | http://localhost:5173 | 5173 |
| Supabase REST API | http://localhost:54321 | 54321 |
| Supabase Functions | http://localhost:54322 | 54322 |
| Postgres | localhost:5432 | 5432 |
| pgAdmin (GUI) | http://localhost:5050 | 5050 |

## 🏥 Health Checks

### Automated Health Check

Run the health check script to verify all services are running:

```bash
# Bash version
bash scripts/dev/healthcheck.sh

# TypeScript version (requires node)
node scripts/dev/healthcheck.ts

# Or with npm (requires setup)
npx ts-node scripts/dev/healthcheck.ts
```

Output should look like:

```
╔════════════════════════════════════════╗
║  Health Check - Local Dev Environment  ║
╚════════════════════════════════════════╝

ℹ Checking services...

✓ Postgres is running on localhost:5432
ℹ Checking Supabase services...
✓ Supabase REST API is running on localhost:54321
ℹ Checking Vite development server...
✓ Vite dev server is running on localhost:8080

════════════════════════════════════════
✓ All checks passed! (3/3)
════════════════════════════════════════
```

### Manual Service Verification

```bash
# Check Postgres
psql -h localhost -U postgres -c "SELECT 1"

# Check Supabase REST API
curl http://localhost:54321/health

# Check Vite
curl http://localhost:8080/

# Check Docker status
docker-compose ps

# View service logs
docker-compose logs supabase
docker-compose logs postgres
```

## 🐳 Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f supabase
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs --tail=50
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart supabase

# Full reset (deletes data)
docker-compose down
docker-compose up -d
```

### Clean Up

```bash
# Stop services (keeps data)
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Remove specific service
docker-compose rm -f supabase

# Prune unused Docker resources
docker system prune -a
```

## 💾 Database Management

### Access PostgreSQL Database

#### Using psql (CLI):

```bash
# Connect to the database
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres

# Run SQL queries
psql -h localhost -U postgres -d postgres -c "SELECT * FROM auth.users LIMIT 1;"

# Restore from backup
psql -h localhost -U postgres -d postgres < backup.sql
```

#### Using pgAdmin (GUI):

1. Open http://localhost:5050
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin`
3. Right-click "Servers" → Register → Server
4. Connection:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

### Reset Database

```bash
# Option 1: Truncate all tables (keeps schema)
npm run seed:database

# Option 2: Full reset (removes containers and volumes)
docker-compose down -v
docker-compose up -d

# Wait a moment, then seed again
sleep 10
npm run seed:database
```

### Create Database Migrations

New migrations go in `supabase/migrations/`:

```bash
# Create new migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql << 'EOF'
-- Your migration SQL here
CREATE TABLE my_table (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);
EOF

# Migrations run automatically when containers start
```

## 🔌 Edge Functions (Supabase Functions)

The local Supabase setup includes edge functions runtime on port 54322.

### Running Edge Functions Locally

```bash
# Option 1: Automatic (included in bootstrap script)
# Already running via Docker

# Option 2: Manual with Supabase CLI
supabase functions serve --no-verify-jwt

# Functions will be available at:
# http://localhost:54322/functions/v1/{function-name}
```

### Calling Edge Functions from Frontend

The Vite proxy automatically routes `/functions/v1/*` to the local Supabase instance:

```typescript
// src/integrations/supabase.ts
const response = await supabase.functions.invoke('my-function', {
  body: { /* payload */ }
});

// This works identically in local and production!
```

### Hot Module Replacement (HMR)

Edge functions don't automatically reload when code changes. You need to:

1. Change the function code in `supabase/functions/{name}/index.ts`
2. Restart the local functions server:
   ```bash
   # If using Docker, restart Supabase
   docker-compose restart supabase
   
   # If using CLI, Ctrl+C and re-run
   supabase functions serve --no-verify-jwt
   ```

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test:coverage

# E2E tests
npm run test:e2e

# UI test runner
npm run test:ui
```

### Test Against Local Services

Tests automatically detect local Supabase via `.env.local`:

```bash
# Make sure Docker is running
docker-compose up -d

# Run tests
npm test
```

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot connect to Supabase" or Port 54321 not responding

```bash
# Check if container is running
docker-compose ps

# Check container logs
docker-compose logs supabase

# Restart Supabase
docker-compose restart supabase

# Or full reset
docker-compose down -v
docker-compose up -d
```

#### Issue: "Port 8080 already in use"

```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
VITE_PORT=3000 npm run dev
```

#### Issue: "Postgres connection refused"

```bash
# Verify Postgres container is running
docker-compose logs postgres

# Check host connectivity
psql -h localhost -U postgres -c "SELECT 1"

# Increase wait time in bootstrap script or manually wait
sleep 15
```

#### Issue: Docker daemon not running

```bash
# Start Docker
# - macOS: Open Docker Desktop app
# - Linux: sudo systemctl start docker
# - Windows: Open Docker Desktop

# Verify Docker is running
docker ps
```

#### Issue: Environment variables not loading

```bash
# Make sure .env.local exists
ls -la .env.local

# Verify variables are set
echo $VITE_SUPABASE_URL

# Manually load the file
export $(cat .env.local | grep -v '^#' | xargs)
```

#### Issue: Database queries return "no such table"

```bash
# Check if migrations have run
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "\dt"

# Run seed script
node scripts/seed-database.mjs

# Check for errors
docker-compose logs postgres
```

### Getting Help

1. **Check logs**: `docker-compose logs -f`
2. **Run health check**: `bash scripts/dev/healthcheck.sh`
3. **Verify prerequisites**: `node --version && npm --version && docker --version`
4. **Try a fresh reset**: `docker-compose down -v && docker-compose up -d`
5. **Check documentation**: `docs/development/` directory

## 📚 Additional Resources

- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/)

## ✨ Development Tips

### Hot Module Replacement (HMR)

Frontend code changes automatically reload in the browser thanks to Vite's HMR:

1. Edit source files in `src/`
2. Save the file
3. Browser automatically updates (usually within 1 second)

Backend/database changes:

1. Edit migrations or seed scripts
2. Restart Docker: `docker-compose restart supabase postgres`
3. Re-run seeds if needed: `npm run seed:database`

### Environment Switching

Switch between local and hosted Supabase by editing `.env.local`:

```env
# Local development
VITE_SUPABASE_URL=http://localhost:54321

# Hosted staging
VITE_SUPABASE_URL=https://staging.supabase.co

# Hosted production
VITE_SUPABASE_URL=https://production.supabase.co
```

Then restart the dev server: `npm run dev`

### Debug Mode

Enable verbose logging:

```bash
# For Supabase client
localStorage.debug = 'supabase:*'

# For Vite
npm run dev -- --debug

# For Docker
docker-compose logs -f --follow
```

### Performance

If development is slow:

1. **Reduce Docker resource limits**: Check Docker Desktop settings
2. **Use native modules**: `npm ci` instead of `npm install`
3. **Check container resources**: `docker stats`
4. **Monitor system resources**: `top` or `Activity Monitor` (macOS)

## 🎯 Next Steps

After setting up your local environment:

1. **Read the main README**: Understand the platform architecture
2. **Explore the codebase**: Start with `src/pages` for route-level components
3. **Run the test suite**: `npm test` to ensure everything works
4. **Try making a change**: Edit a component in `src/components` and watch HMR in action

Happy coding! 🚀
