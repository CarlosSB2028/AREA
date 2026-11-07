# API Configuration and Environment

This document explains the environment variables, API endpoints, and client configuration used by the AREA Web frontend.

## Environment Variables

### Quick Setup

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update the variables in `.env.local` as needed.

### Available Variables

| Variable                     | Description                                   | Default Value         | Examples                          |
|------------------------------|-----------------------------------------------|-----------------------|-----------------------------------|
| `NEXT_PUBLIC_API_URL`        | Base URL of the backend API                  | `http://localhost:8080` | `https://api.example.com`         |
| `NEXT_PUBLIC_USE_MOCK_DATA`  | Enable mock data for frontend-only testing   | `false`               | `true` for development without backend |
| `NEXT_PUBLIC_ENVIRONMENT`    | Runtime environment                          | `development`         | `staging`, `production`           |

### OAuth Configuration (Optional)

If integrating social login providers, add the following variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
```

## API Endpoints

All API endpoints are defined in `src/config/api.ts`. Key groups include:

- **Authentication**: Login, register, logout, refresh, user status
- **User Management**: Profile, avatar upload, user info retrieval
- **Areas & Services**: List, create, update areas; list services; action definitions

## Axios Configuration

The Axios instance in `src/config/axios.ts` centralizes HTTP behavior. Key features include:

- Sending credentials/cookies when required
- Automatic token refresh on 401 responses
- Logging requests/responses in development
- Centralized error handling with user-friendly messages

## Development Modes

### Mock Mode (Frontend-Only)

Enable mock data for development without a backend:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

In this mode, API calls are intercepted and resolved with mock responses from `src/mocks/` or `cypress/fixtures/`.

### API Mode (Backend Calls)

Use the backend API for development:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Deployment Environments

Examples of environment variable values for different environments:

- **Development**: `NEXT_PUBLIC_API_URL=http://localhost:8080`, `NEXT_PUBLIC_ENVIRONMENT=development`
- **Staging**: `NEXT_PUBLIC_API_URL=https://api-staging.example.com`, `NEXT_PUBLIC_ENVIRONMENT=staging`
- **Production**: `NEXT_PUBLIC_API_URL=https://api.example.com`, `NEXT_PUBLIC_ENVIRONMENT=production`

## Security Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to client-side code. Never store secrets there.
- Always use HTTPS in staging and production environments.
- Configure CORS on the backend to allow requests from the frontend origin.

## Troubleshooting

### Common Issues

- **CORS Errors**: Verify backend CORS configuration.
- **401 Unauthorized**: Check cookies, token flow, and `NEXT_PUBLIC_USE_MOCK_DATA` setting.
- **Network Errors**: Ensure `NEXT_PUBLIC_API_URL` is correct and the backend is running.

### Quick Connectivity Test

```bash
# Start the development server and test the login status endpoint
yarn dev
```
