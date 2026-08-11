# BUS TRANSIT — Enterprise Real-Time Bus Transit Management Platform

[![CI/CD Pipeline](https://github.com/bus-transit/bus-transit/actions/workflows/ci.yml/badge.svg)](https://github.com/bus-transit/bus-transit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791.svg)](https://www.postgresql.org/)

**BUS TRANSIT** is an enterprise-scale, production-grade public transportation management system designed to monitor, optimize, and orchestrate bus fleets in real time. It serves commuters, drivers, depot operators, and system commanders with live telematics, AI predictions, and multi-modal route planning.

---

## 🌟 Core System Features

### 1. 🗺️ Live GPS Telematics & Interactive Map
- **Animated Bus Movement**: Live Leaflet vector map tracking real-time bus speeds, headings, and occupancy levels.
- **Dynamic Route Layers**: Color-coded polylines, major transfer hubs, and depot locations with instant popups.
- **Live Telemetry Engine**: Simulated GPS stream transmitting real-time coordinates over REST & WebSocket/SSE endpoints.

### 2. 🤖 Gemini AI Transit Intelligence
- **Natural Language Assistant**: Conversational AI answering schedule queries, calculating fares, and taking delay reports.
- **Smart Journey Planner**: Multi-modal route recommendations optimized for speed, cost, or fewest transfers.
- **AI ETA & Crowding Engine**: Algorithmic arrival predictions factoring historical telemetry, weather, and peak load.

### 3. 👥 Multi-Role Role-Based Control (RBAC)
- **Commuter Portal**: Route search, stop ETAs, trip history, saved favorite routes, and fare calculator.
- **Driver Terminal (HUD)**: Digital speedometer, active route progress checklist, passenger load counter, delay broadcast trigger.
- **Depot Admin Ops**: Fleet vehicle roster, driver allocation, depot announcements, and workshop maintenance logger.
- **Super Admin Command Center**: System performance metrics, security audit logs (OWASP Top 10), global fleet overview, and user directory.

---

## 🏗️ System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                            BUS TRANSIT PLATFORM ARCHITECTURE                      |
+-----------------------------------------------------------------------------------+
    [ Commuter Portal ]      [ Driver Terminal ]      [ Depot Operations ]
             |                      |                         |
             +----------------------+-------------------------+
                                    |
                           ( REST / SSE Telemetry )
                                    v
                     +----------------------------+
                     |   Express API Gateway      |
                     |   (Port 3000)              |
                     +----------------------------+
                       /          |            \
                      /           |             \
                     v            v              v
      +------------------+  +-----------+  +-------------------+
      | PostgreSQL DB    |  | Redis     |  | Gemini 2.5 Flash  |
      | PostGIS Telemetry|  | Telemetry |  | AI Inference      |
      +------------------+  +-----------+  +-------------------+
```

---

## 🛠️ Quick Start & Installation

### Option 1: Local Development
```bash
# 1. Clone repository
git clone https://github.com/bus-transit/bus-transit.git
cd bus-transit

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000)
npm run dev
```

### Option 2: Docker Compose (Full-Stack Containerized)
```bash
# Launch application container, PostGIS, Redis, and MQTT broker
docker-compose up -d --build
```

---

## 📊 Database Schema (Prisma / PostGIS)

The PostgreSQL schema is defined in `prisma/schema.prisma` with GIS extensions for spatial queries:

- `User` — Commuters, Drivers, Depot Admins, Super Admins
- `Depot` — Depot capacities, manager contact, coordinates
- `Route` & `Stop` — Polyline spatial coordinates, fares, and sequence order
- `Bus` — Fleet telemetry, license plates, fuel levels, crowding ratios
- `AuditLog` — Security trail for OWASP top 10 compliance

---

## 📜 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server uptime & subsystem health status |
| `GET` | `/api/buses` | Retrieve all active bus telematics |
| `POST` | `/api/buses/:id/status` | Update bus status & passenger counts |
| `POST` | `/api/telemetry/simulate` | Toggle live GPS simulation stream |
| `POST` | `/api/ai/chat` | Query Gemini AI transit model |
| `POST` | `/api/ai/predict-eta` | AI arrival time prediction engine |
| `POST` | `/api/ai/route-recommend` | Smart journey route planner |
| `GET` | `/api/audit-logs` | Retrieve security audit trail |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
