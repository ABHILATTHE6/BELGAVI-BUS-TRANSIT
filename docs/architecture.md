# System Architecture

## Overview

Belagavi City Bus Transit is designed as a full-stack transit platform connecting commuters, drivers, depot administrators, and system administrators.

```text
Commuter / Driver / Depot Admin / Super Admin
                    |
                    v
             React + TypeScript
                    |
                    v
             Express API Server
                    |
          +---------+---------+
          |                   |
          v                   v
     Transit Data        Gemini AI Assistant
          |
          v
 PostgreSQL / Prisma / PostGIS
          |
          v
 Bus, Route, Stop, Schedule,
 Telemetry, Notification & Audit Data
```

## Frontend

The frontend is built with React, TypeScript, Vite, Tailwind CSS, Lucide icons, Motion, and Leaflet. The UI is organized around transit workflows such as live tracking, route discovery, schedules, administration, notifications, and analytics.

## Backend

The Node.js/Express backend provides the application API and server-side integration points. `tsx` is used during development and esbuild is used to bundle the production server.

## AI Layer

The application integrates Google's Gemini SDK for an AI transit assistant. API credentials must remain server-side and must never be committed to the repository.

## Data Layer

The planned production data layer uses PostgreSQL with Prisma ORM. PostGIS is intended for geospatial transit data such as stops, routes, and vehicle locations.

## Core Domain Objects

- User
- Depot
- Driver
- Bus
- Route
- Stop
- RouteStop
- Schedule
- TelemetryLog
- Announcement
- Notification
- Favorite
- TripHistory
- AuditLog

## Security Principles

- Keep secrets in environment variables.
- Never commit `.env` files.
- Apply role-based access control to protected operations.
- Validate API input on the server.
- Record sensitive administrative actions in audit logs.

## Future Architecture Improvements

- WebSocket or Server-Sent Events for production vehicle telemetry.
- Dedicated authentication service or managed identity provider.
- Redis for short-lived ETA and telemetry caching.
- Background workers for notifications and analytics processing.
- Production PostGIS deployment for geospatial queries.
