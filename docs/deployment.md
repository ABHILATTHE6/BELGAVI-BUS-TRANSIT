# Deployment Guide

## Local Production Build

```bash
npm ci
npm run lint
npm test
npm run build
npm start
```

The application exposes the server on port `3000`.

## Docker

Build the production image:

```bash
docker build -t belagavi-city-bus-transit:latest .
```

Run it:

```bash
docker run --rm -p 3000:3000 belagavi-city-bus-transit:latest
```

Health check:

```text
GET http://localhost:3000/api/health
```

## Environment Variables

Use `.env.example` as the template. Never bake secrets into an image or commit `.env`.

## Production Hardening Checklist

- Configure a managed PostgreSQL/PostGIS database.
- Replace mock authentication with secure identity management.
- Store secrets in the deployment platform's secret manager.
- Put the service behind HTTPS and a reverse proxy.
- Add structured application logs and monitoring.
- Add rate limiting and request validation at the API boundary.
- Replace simulated telemetry with authenticated GPS ingestion.
- Configure Redis/MQTT only after the corresponding services are actually deployed.
