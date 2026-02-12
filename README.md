# Poke-Idle Legacy

A Pokemon-inspired Idle Clicker RPG with Gacha mechanics.

## Tech Stack

- **Backend:** AdonisJS 6, PostgreSQL, Lucid ORM
- **Frontend:** Nuxt 3, TailwindCSS, Pinia
- **DevOps:** Docker, GitHub Actions CI/CD

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Git

### Development (with Docker)

```bash
# Clone the repo
git clone git@github.com:<your-username>/poke-idle-legacy.git
cd poke-idle-legacy

# Start all services (PostgreSQL + Server + Client)
docker compose up -d

# Run migrations & seed
docker compose exec server node ace migration:run
docker compose exec server node ace seed:pokedex
```

### Development (local)

```bash
# Install root dependencies
npm install

# Install sub-project dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# Start PostgreSQL only
docker compose up -d postgres

# Run both dev servers
npm run dev
```

### Useful Commands

```bash
# View logs
docker compose logs -f

# Rebuild containers
docker compose build --no-cache

# Stop everything
docker compose down

# Run migrations
npm run db:migrate

# Seed Pokedex from Tyradex API
npm run db:seed
```

## Project Structure

```
poke-idle-legacy/
├── .github/workflows/    # CI/CD pipelines
├── client/               # Nuxt 3 frontend
├── server/               # AdonisJS 6 backend
├── docker-compose.yml    # Full-stack Docker orchestration
├── docker-compose.prod.yml # Production overrides
└── README.md
```

## CI/CD

On push to `main`, GitHub Actions will:
1. Run linting and tests
2. Build Docker images
3. Push to container registry
4. Deploy to production server via SSH
