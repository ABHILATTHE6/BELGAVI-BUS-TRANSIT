# 🚌 Belagavi City Bus Transit

A full-stack public transportation management platform for Belagavi, Karnataka. The project provides live bus telemetry simulation, route and stop discovery, ETA assistance, role-based dashboards, depot operations, announcements, analytics, and a Gemini-powered transit assistant.

> **Portfolio project:** This repository is being developed incrementally with documented milestones, testing, CI, and deployment improvements.

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
- 🗄️ Prisma/PostgreSQL/PostGIS schema for future persistent storage
- 🐳 Docker Compose configuration
- ⚙️ GitHub Actions CI pipeline

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Maps | Leaflet |
| Backend | Node.js, Express |
| AI | Google Gemini API |
| Database | PostgreSQL, PostGIS, Prisma schema |
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

## 🚀 Local Setup

### Prerequisites

- Node.js 20+
- npm
- Optional: Docker Desktop for database/container development

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and add your Gemini API key if AI API access is required.

```bash
cp .env.example .env
```

Never commit `.env` or API keys.

### Run

```bash
npm run dev
```

The application is served on port `3000`.

### Validate

```bash
npm run lint
npm run build
```

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

## 🗂️ Project Structure

```text
belagavi-city-bus-transit/
├── .github/workflows/ci.yml
├── prisma/schema.prisma
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── docker-compose.yml
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## 🛣️ Roadmap

- [x] Initial commuter, driver and admin dashboards
- [x] Live telemetry simulation
- [x] Route and schedule data
- [x] Gemini assistant integration
- [x] Analytics views
- [ ] Persistent PostgreSQL/PostGIS integration
- [ ] Production authentication and secure sessions
- [ ] Real GPS device ingestion
- [ ] WebSocket/SSE production telemetry stream
- [ ] Automated API and UI tests
- [ ] Production deployment
- [ ] PWA/mobile experience

## 🔒 Security Notes

This repository contains demo/mock data. Authentication and telemetry are currently designed for demonstration and development. Production deployment should add secure authentication, authorization, validation, rate limiting, secret management, database persistence and real observability.

## 📄 License

MIT License.
