# AREA - Action REAction Platform

A comprehensive automation platform that connects various services and triggers actions based on events. AREA allows users to create powerful workflows by linking different applications and services together.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Services](#services)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

AREA (Action REAction) is a full-stack application consisting of:
- **Backend**: Spring Boot API with PostgreSQL and Redis
- **Web Client**: Next.js web application
- **Mobile Client**: React Native (Expo) mobile application
- **Monitoring**: Prometheus, Grafana, and Loki stack

## 🏗️ Architecture

The project is organized into the following components:

```
AREA/
├── App/
│   ├── Back/        # Spring Boot backend
│   ├── Web/         # Next.js web client
│   └── Mobile/      # React Native mobile client
├── deployement/     # Deployment configurations (Ansible, Terraform, Docker)
└── monitoring/      # Monitoring stack configuration
```

## ⚙️ Prerequisites

Before starting, ensure you have the following installed:

- **Docker** (v24.0+)
- **Docker Compose** (v2.20+)
- Minimum **8GB RAM** available
- Minimum **10GB** free disk space

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SamTess/AREA.git
cd AREA
```

### 2. Configure Environment Variables

Create a `.env` file at the root of the project. See the [Environment Configuration](#environment-configuration) section for details.

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build the backend, web, and mobile applications
- Set up PostgreSQL and Redis databases
- Configure the monitoring stack (Prometheus, Grafana, Loki)
- Start all services in the correct order

### 4. Access the Applications

Once all services are running:

- **Web Application**: http://localhost:8081
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Grafana Dashboard**: http://localhost:3000 (default: admin/admin)
- **Prometheus**: http://localhost:9090

### 5. Download Mobile APK

The mobile APK is automatically built and available in the shared volume. You can extract it with:

```bash
docker cp area-client-mobile:/output/client.apk ./client.apk
```

## 🔐 Environment Configuration

Create a `.env` file at the root of the project with the following variables:

### Database Configuration
```env
# PostgreSQL
POSTGRES_DB=area
POSTGRES_USER=area_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### Backend Configuration
```env
# Spring Boot
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=your_jwt_secret_key_min_256_bits
JWT_EXPIRATION=86400000

# Email Configuration (for user verification)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@area.com
```

### External Services (OAuth & APIs)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Other service API keys as needed
```

### Frontend Configuration
```env
# Web Client
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WEB_URL=http://localhost:8081

# Mobile Client
EXPO_PUBLIC_API_URL=http://localhost:8080
```

### Monitoring Configuration
```env
# Grafana
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🐳 Services

The docker-compose setup includes the following services:

| Service | Description | Port |
|---------|-------------|------|
| `postgres` | PostgreSQL database | 5432 |
| `redis` | Redis cache | 6379 |
| `area-backend` | Spring Boot API | 8080 |
| `client_web` | Next.js web application | 8081 |
| `client_mobile` | React Native APK builder | - |
| `prometheus` | Metrics collection | 9090 |
| `grafana` | Monitoring dashboards | 3000 |
| `loki` | Log aggregation | 3100 |
| `promtail` | Log collector | - |

## 📚 Documentation

Each component has its own detailed documentation:

- **Backend**: [App/Back/README.md](./App/Back/README.md)
- **Web Client**: [App/Web/README.md](./App/Web/README.md)
- **Mobile Client**: [App/Mobile/README.md](./App/Mobile/README.md)
- **Deployment**: [deployement/docs/README.md](./deployement/docs/README.md)

## 🤝 Contributing

We welcome contributions! Please see [HOWTOCONTRIBUTE.md](./HOWTOCONTRIBUTE.md) for guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review component-specific README files

## 🔧 Troubleshooting

### Services not starting
- Ensure Docker daemon is running
- Check available disk space and memory
- Review logs: `docker-compose logs [service_name]`

### Port conflicts
- Check if ports 8080, 8081, 3000, 5432, 6379 are available
- Modify port mappings in `docker-compose.yml` if needed

### Database connection issues
- Verify `.env` configuration
- Check database health: `docker-compose ps`
- Review backend logs: `docker-compose logs area-backend`

### Build failures
- Clean Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

---

**Made with ❤️ by the AREA Team**