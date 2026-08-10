# 🚌 Belagavi City Bus Transit

A full-stack public transportation management platform for Belagavi, Karnataka. The platform is being developed as a portfolio-grade smart transit system connecting commuters, drivers, depot administrators, and system administrators.

It combines bus and route discovery, telemetry simulation, ETA assistance, operational dashboards, announcements, analytics, and an AI transit assistant.

> **Development status:** Active portfolio project. Features are being implemented incrementally through documented milestones.

## 🎯 Problem Statement

Public bus users often lack a single place to discover routes, check service information, understand expected arrival times, and receive timely announcements. Transit operators also need operational tools for fleet, route, driver, and service management.

Belagavi City Bus Transit aims to provide a unified digital platform for both sides of the transit ecosystem.

## ✨ Core Features

- 🗺️ Live bus tracking and interactive route map
- 🚌 Bus fleet and telemetry simulation
- 📍 Route and stop discovery
- ⏱️ ETA and delay information
- 📅 Bus schedule management
- 👤 Commuter, Driver, Depot Admin and Super Admin views
- 📢 Transit announcements and notifications
- 🤖 Gemini AI transit assistant
- 📊 Operations and passenger analytics
- 🔐 Role-oriented access flows and audit logs
- 🗄️ Prisma/PostgreSQL/PostGIS data model
- 🐳 Docker Compose configuration
- ⚙️ GitHub Actions CI pipeline

## 🏗️ Architecture

```text
Users
  │
  ▼
React + TypeScript + Vite
  │
  ▼
Node.js + Express API
  ├──────────────► Gemini AI
  │
  ▼
PostgreSQL + Prisma + PostGIS
  │
  ▼
Transit, fleet, schedule, telemetry,
notification and audit data
```

See the detailed [system architecture](docs/architecture.md).

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Maps | Leaflet |
| Backend | Node.js, Express |
| AI | Google Gemini API |
| Database | PostgreSQL, PostGIS, Prisma |
| Build | Vite, esbuild, TypeScript |
| DevOps | Docker Compose, GitHub Actions |

## 👥 User Roles

### Commuter
Search routes and stops, monitor buses, view ETAs, schedules, announcements and trip information.

### Driver
View assigned operations, bus status and passenger information.

### Depot Admin
Manage buses, routes, drivers, announcements and depot operations.

### Super Admin
Review system-wide analytics, audit activity and fleet information.

## 🚀 Local Development

### Prerequisites

- Node.js 20+ recommended
- npm
- Git
- PostgreSQL when persistent database features are enabled
- Gemini API key when AI API access is enabled

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and provide the values required by the features you enable.

```bash
cp .env.example .env
```

Never commit `.env`, passwords, tokens, or API keys.

### Run

```bash
npm run dev
```

### Validate

```bash
npm run lint
npm run build
```

For more details, see [Development Guide](docs/development.md).

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service health and telemetry status |
| GET | `/api/buses` | List/filter buses |
| GET | `/api/buses/:id` | Get a bus |
| POST | `/api/buses/:id/status` | Update bus status |
| POST | `/api/buses` | Add a bus |
| GET | `/api/routes` | List routes |
| GET | `/api/routes/:id` | Get a route |
| POST | `/api/routes` | Add a route |
| GET | `/api/depots` | List depots |
| GET | `/api/schedules` | List schedules |
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` | Create announcement |
| GET | `/api/analytics` | Operations analytics |
| POST | `/api/ai/chat` | Gemini transit assistant |
| POST | `/api/ai/predict-eta` | ETA prediction demo |
| POST | `/api/ai/route-recommend` | Route recommendation demo |

> API availability should be verified against the currently implemented server routes as the application source is migrated and tested.

## 📂 Repository Structure

```text
belagavi-city-bus-transit/
├── .github/workflows/
├── docs/
│   ├── architecture.md
│   ├── development.md
│   └── roadmap.md
├── prisma/
├── src/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── docker-compose.yml
├── LICENSE
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## 🛣️ Roadmap

See the complete roadmap in [docs/roadmap.md](docs/roadmap.md).

Current priorities:

- Live transit core
- Route and stop search
- Bus schedules and ETA
- Driver and depot operations
- Notifications and announcements
- AI transit assistance
- Analytics
- Automated testing and CI/CD
- Production database and deployment

## 🔒 Security

This project currently contains demo/mock transit data and is under active development. Production deployment must include secure authentication, authorization, input validation, rate limiting, secret management, persistent database security, auditability, and observability.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and commit conventions.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
