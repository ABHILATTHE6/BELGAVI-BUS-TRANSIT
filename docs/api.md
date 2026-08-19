# API Reference

This document describes the REST endpoints currently implemented by the Belagavi City Bus Transit backend.

## Base URL

Local development:

```text
http://localhost:3000
```

All endpoints are currently served by `server.ts` and use JSON responses.

## Health and System

### `GET /api/health`

Returns application health, uptime, active bus count, telemetry simulator state, and the configuration state of external services.

Example:

```json
{
  "status": "online",
  "telemetrySimulator": "active",
  "services": {
    "database": {
      "status": "not_configured",
      "provider": "PostgreSQL / PostGIS",
      "mode": "in-memory-mock-data"
    },
    "redis": {
      "status": "not_configured"
    },
    "mqtt": {
      "status": "not_configured",
      "broker": "tcp://localhost:1883"
    }
  }
}
```

## Authentication

### `GET /api/auth/me`

Returns the mock user associated with the requested role.

Query parameter:

```text
role=commuter|driver|depot_admin|super_admin
```

### `POST /api/auth/login`

Accepts mock login information and returns a mock token and user record.

Example request:

```json
{
  "email": "user@example.com",
  "role": "commuter"
}
```

> Authentication is currently a development mock and is not suitable for production use.

## Buses and Telemetry

### `GET /api/buses`

Returns the current in-memory bus collection.

Optional filters:

```text
routeId=<route-id>
depotId=<depot-id>
status=<bus-status>
```

Filters can be combined.

### `GET /api/buses/:id`

Returns a bus by internal ID or fleet number.

Returns `404` when the bus cannot be found.

### `POST /api/buses`

Creates a bus in the current in-memory fleet.

The backend supplies defaults for fields that are not provided.

Returns `201 Created` with the new bus record.

### `POST /api/buses/:id/status`

Updates the operational status, passenger count, and driver name for a bus.

Returns `404` when the bus cannot be found.

### `POST /api/telemetry/toggle-simulator`

Toggles the in-memory telemetry simulation on or off.

## Routes and Stops

### `GET /api/routes`

Returns all current routes.

### `GET /api/routes/:id`

Returns a route by internal ID or route code.

Returns `404` when the route cannot be found.

### `POST /api/routes`

Creates a route using the supplied route data and development defaults.

## Additional Resources

The backend also exposes endpoints for announcements, notifications, schedules, analytics, favorites, trip history, audit logs, depot administration, and AI-assisted transit features. These should be added to this reference as their contracts stabilize.

## Response and Error Conventions

Current endpoints use JSON responses. Resource lookups return HTTP `404` when the requested entity does not exist. Successful resource creation uses HTTP `201` where implemented.

The current backend uses mock/in-memory state, so changes are reset when the server restarts. Persistent PostgreSQL/PostGIS integration is planned for a later development phase.

## Development Validation

Before submitting API changes, run:

```bash
npm run lint
npm run build
```

For endpoint-level verification, start the development server:

```bash
npm run dev
```

Then test an endpoint such as:

```powershell
Invoke-RestMethod http://localhost:3000/api/health | ConvertTo-Json -Depth 5
```
