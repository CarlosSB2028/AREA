# Docker Setup for AREA Web

This directory contains Docker configurations for both development and production environments.

## 📁 Files

- `Dockerfile.dev.web` - Development Docker image with hot reload
- `Dockerfile.web` - Production-optimized Docker image (multi-stage build)
- `docker-compose.yml` - Development environment setup
- `docker-compose.prod.yml` - Production environment setup
- `.env.example` - Template for environment variables

## 🚀 Quick Start

### Development Environment (with Hot Reload)

1. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration

3. Start the development environment:
   ```bash
   docker-compose -f Docker/docker-compose.yml up --build
   ```

4. Access the application at `http://localhost:3000`

The development setup includes:
- ✅ Hot reload for code changes
- ✅ Volume mounts for instant updates
- ✅ Development dependencies
- ✅ Source maps and debugging

### Production Environment

1. Ensure your `.env` file has production values

2. Build and start the production environment:
   ```bash
   docker-compose -f Docker/docker-compose.prod.yml up --build -d
   ```

3. Access the application at `http://localhost:3000`

The production setup includes:
- ✅ Multi-stage build for minimal image size
- ✅ Optimized Next.js build
- ✅ Health checks
- ✅ Resource limits
- ✅ Non-root user execution
- ✅ Automatic restart on failure

## 🛠️ Common Commands

### Development

```bash
# Start services
docker-compose -f Docker/docker-compose.yml up

# Start in detached mode
docker-compose -f Docker/docker-compose.yml up -d

# Rebuild containers
docker-compose -f Docker/docker-compose.yml up --build

# Stop services
docker-compose -f Docker/docker-compose.yml down

# View logs
docker-compose -f Docker/docker-compose.yml logs -f web

# Execute commands in container
docker-compose -f Docker/docker-compose.yml exec web sh
```

### Production

```bash
# Start services
docker-compose -f Docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f Docker/docker-compose.prod.yml logs -f web

# Stop services
docker-compose -f Docker/docker-compose.prod.yml down

# Restart services
docker-compose -f Docker/docker-compose.prod.yml restart web
```

## 🔍 Troubleshooting

### Hot Reload Not Working

If changes aren't reflected in development:
1. Ensure `WATCHPACK_POLLING=true` is set in docker-compose.yml
2. Check that volumes are properly mounted
3. Restart the container: `docker-compose -f Docker/docker-compose.yml restart web`

### Port Already in Use

If port 3000 is already in use:
1. Stop the conflicting process: `lsof -ti:3000 | xargs kill -9`
2. Or change the port in docker-compose.yml: `"3001:3000"`

### Build Failures

If the build fails:
1. Clear Docker cache: `docker system prune -a`
2. Remove old images: `docker-compose -f Docker/docker-compose.yml down --rmi all`
3. Rebuild: `docker-compose -f Docker/docker-compose.yml up --build`

### Out of Memory

If you encounter memory issues:
1. Increase Docker Desktop memory allocation
2. Adjust resource limits in docker-compose.prod.yml

## 📊 Production Optimizations

The production Dockerfile includes:

1. **Multi-stage build** - Reduces final image size by ~70%
2. **Standalone output** - Next.js optimized deployment
3. **Layer caching** - Faster rebuilds with dependency caching
4. **Security** - Runs as non-root user
5. **Health checks** - Automatic container health monitoring

## 🔐 Environment Variables

Required environment variables (add to `.env`):

```env
NODE_ENV=development|production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📝 Notes

- Development mode uses `npm run dev` with hot reload enabled
- Production mode uses optimized Next.js standalone build
- All sensitive data should be in `.env` (never commit this file)
- The `.dockerignore` file excludes unnecessary files from the build

## 🆘 Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
