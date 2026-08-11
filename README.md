# 🚌 Belagavi City Bus Transit

A full-stack smart public transportation platform designed for **Belagavi, Karnataka**.

The project aims to provide commuters with a centralized platform to discover bus routes, track buses, view schedules, receive announcements, and get estimated arrival information. It also provides operational tools for drivers, depot administrators, and system administrators.

> **Project Status:** 🚧 Active Development  
> This project is being developed incrementally as a portfolio-grade software engineering project.

---

## 🎯 Problem Statement

Public transportation users often face difficulties finding:

- Available buses
- Bus routes
- Bus stops
- Expected arrival times
- Service announcements
- Route alternatives
- Current bus locations

At the same time, transit operators need better tools to manage:

- Buses
- Drivers
- Routes
- Schedules
- Depots
- Announcements
- Fleet operations
- Transit analytics

**Belagavi City Bus Transit** aims to bring these capabilities together in one platform.

---

# ✨ Features

## 🚌 Commuter Features

- Search available bus routes
- Search bus stops
- View bus information
- View schedules
- View estimated arrival times
- Track buses on a map
- View service announcements
- Receive transit notifications
- View route information
- AI-powered transit assistance

## 🚍 Driver Features

- Driver dashboard
- Assigned bus information
- Route information
- Bus status
- Operational information
- Trip information

## 🏢 Depot Administration

- Manage buses
- Manage drivers
- Manage routes
- Manage schedules
- Publish announcements
- Monitor fleet activity
- View depot-level analytics

## 👨‍💼 Super Administration

- System-wide analytics
- Fleet monitoring
- Depot management
- System audit information
- Transit operations overview

## 🤖 AI Features

The platform includes a Gemini-powered AI assistant intended to help users with:

- Route recommendations
- Transit questions
- ETA assistance
- Travel planning
- Transit information

> API keys must be stored securely in environment variables and must never be committed to GitHub.

---

# 🏗️ System Architecture

```text
                    USERS
                      │
        ┌─────────────┼─────────────┐
        │             │             │
     Commuter       Driver      Admins
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
          React + TypeScript + Vite
                      │
                      ▼
             Node.js + Express
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
       Transit      Gemini      Services
         API          AI
          │
          ▼
       PostgreSQL
          │
          ▼
     Prisma / PostGIS
```

Detailed architecture documentation:

- [System Architecture](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Project Roadmap](docs/roadmap.md)

---

# 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Maps | Leaflet / React Leaflet |
| Backend | Node.js |
| API | Express |
| AI | Google Gemini |
| ORM | Prisma |
| Database | PostgreSQL |
| Geospatial | PostGIS |
| Development | VS Code |
| Version Control | Git + GitHub |
| CI/CD | GitHub Actions |
| Containerization | Docker |

---

# 👥 User Roles

## Commuter

A commuter can:

- Search routes
- Search buses
- Find stops
- View schedules
- Track buses
- Check ETA
- View announcements
- Use the AI assistant

## Driver

A driver can:

- View assigned bus
- View assigned route
- Check trip information
- Update bus status
- View operational information

## Depot Admin

A depot administrator can:

- Manage buses
- Manage drivers
- Manage routes
- Manage schedules
- Publish announcements
- Monitor depot operations

## Super Admin

The super administrator can:

- Monitor the entire transit system
- Review analytics
- Manage depots
- Review fleet operations
- Review audit information

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js
- npm
- Git
- PostgreSQL for database-backed features
- Docker Desktop if using Docker
- VS Code recommended

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 📥 Installation

Clone the repository:

```bash
git clone https://github.com/ABHILATTHE6/BELGAVI-BUS-TRANSIT.git
```

Enter the project:

```bash
cd BELGAVI-BUS-TRANSIT
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Configuration

Create a local `.env` file from `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Never commit `.env`.

The repository intentionally contains:

```text
.env.example
```

but not:

```text
.env
```

---

# ▶️ Run the Application

Start development mode:

```bash
npm run dev
```

Build the production application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# 🧪 Code Validation

Run TypeScript validation:

```bash
npm run lint
```

Build the complete application:

```bash
npm run build
```

The project should pass both commands before submitting a pull request.

---

# 🔌 API Overview

The backend currently provides or is designed around endpoints such as:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service health |
| GET | `/api/buses` | List buses |
| GET | `/api/buses/:id` | Get bus |
| POST | `/api/buses` | Add bus |
| POST | `/api/buses/:id/status` | Update bus status |
| GET | `/api/routes` | List routes |
| GET | `/api/routes/:id` | Get route |
| POST | `/api/routes` | Add route |
| GET | `/api/depots` | List depots |
| GET | `/api/schedules` | List schedules |
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` | Create announcement |
| GET | `/api/analytics` | Analytics |
| POST | `/api/ai/chat` | AI assistant |
| POST | `/api/ai/predict-eta` | ETA prediction |
| POST | `/api/ai/route-recommend` | Route recommendation |

> API endpoints will evolve as the project moves toward production architecture.

---

# 📂 Project Structure

```text
belagavi-city-bus-transit/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── assets/
│
├── docs/
│   ├── architecture.md
│   ├── development.md
│   ├── local-upload.md
│   ├── roadmap.md
│   └── source-migration.md
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── components/
│   │   ├── AIChatbotModal.tsx
│   │   ├── AnalyticsView.tsx
│   │   ├── CommuterView.tsx
│   │   ├── DepotAdminView.tsx
│   │   ├── DriverView.tsx
│   │   ├── Header.tsx
│   │   ├── MapView.tsx
│   │   ├── Navigation.tsx
│   │   └── SuperAdminView.tsx
│   │
│   ├── data/
│   │   └── mockData.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── README.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

# 🗺️ Roadmap

## Phase 1 — Foundation

- [x] Repository creation
- [x] Git configuration
- [x] Environment template
- [x] README
- [x] Contribution guidelines
- [x] Architecture documentation
- [x] Development documentation
- [x] Project roadmap

## Phase 2 — Transit Core

- [ ] Bus tracking
- [ ] Route search
- [ ] Stop search
- [ ] Bus schedules
- [ ] ETA system
- [ ] Service status

## Phase 3 — Operations

- [ ] Driver management
- [ ] Depot management
- [ ] Fleet management
- [ ] Route assignment
- [ ] Schedule management
- [ ] Announcements
- [ ] Notifications

## Phase 4 — AI

- [ ] Gemini AI assistant
- [ ] Route recommendations
- [ ] ETA assistance
- [ ] Delay analysis
- [ ] Intelligent transit search

## Phase 5 — Engineering

- [ ] Automated tests
- [ ] API tests
- [ ] Frontend tests
- [ ] CI/CD
- [ ] Database integration
- [ ] Error monitoring
- [ ] Logging
- [ ] Performance optimization

## Phase 6 — Production

- [ ] Real GPS integration
- [ ] WebSocket/SSE live updates
- [ ] Production authentication
- [ ] PostgreSQL deployment
- [ ] PostGIS geospatial queries
- [ ] Production deployment
- [ ] Accessibility audit
- [ ] Security audit
- [ ] v1.0 release

---

# 🔒 Security

Security is a major requirement of this project.

Never commit:

```text
.env
API keys
passwords
database credentials
private tokens
authentication secrets
```

Use environment variables instead.

The `.gitignore` file protects local environment files.

Production deployment will additionally require:

- Authentication
- Authorization
- Role-based access control
- Input validation
- Rate limiting
- Secure secret management
- Audit logging
- Database security
- HTTPS
- Error monitoring

---

# 🧪 Current Development Status

The application currently contains:

- React frontend
- TypeScript
- Express backend
- Transit UI
- Map interface
- Mock transit data
- Telemetry simulation
- Administrative views
- Analytics interface
- Gemini AI interface
- Prisma schema
- Docker configuration
- GitHub Actions configuration

The application currently builds successfully with:

```bash
npm run lint
npm run build
```

---

# 🤝 Contributing

Contributions are welcome.

Please read:

```text
CONTRIBUTING.md
```

before submitting changes.

Use meaningful commit messages such as:

```text
feat: add live bus tracking
fix: correct ETA calculation
docs: update API documentation
refactor: improve route service
test: add bus API tests
ci: improve build workflow
```

---

# 📈 Development Philosophy

This project is being developed incrementally.

Each development milestone should contain:

1. A clearly defined objective
2. Actual code or documentation changes
3. Testing
4. A meaningful Git commit
5. GitHub history
6. Documentation where appropriate

The goal is to demonstrate genuine software engineering practices rather than simply uploading a finished project.

---

# 👨‍💻 Author

**ABHISHEK LATTHE**

GitHub:

https://github.com/ABHILATTHE6

Repository:

https://github.com/ABHILATTHE6/BELGAVI-BUS-TRANSIT

---

# 📄 License

This project is licensed under the MIT License.

See [LICENSE](LICENSE) for details.