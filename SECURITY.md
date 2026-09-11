# Security Policy

## Current Status

This project is a development and portfolio application. It uses mock authentication and in-memory transit data in the current runtime.

## Secrets

Never commit API keys, passwords, database credentials, session secrets, or `.env` files. Use environment variables and the deployment platform's secret manager.

## Reporting a Vulnerability

Do not publish sensitive vulnerability details in a public issue. Contact the repository owner privately through the GitHub profile and include reproduction steps, affected files, and impact details.

## Production Requirements

Before public production deployment, the application should add secure authentication, authorization, input validation, rate limiting, dependency scanning, HTTPS, secure headers, auditability, database security, and centralized monitoring.
