# Docker Setup Guide

This project now includes Docker support for both development and production environments.

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Development Setup

1. **Clone and setup environment:**
   ```bash
   git clone <repository-url>
   cd business-matchmaking
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

2. **Start development environment:**
   ```bash
   docker-compose --profile dev up
   ```

3. **Access your application:**
   - Application: http://localhost:3001
   - Hot reload is enabled for development

### Production Setup

1. **Build and run production container:**
   ```bash
   docker-compose up app
   ```

2. **Or build manually:**
   ```bash
   docker build -t business-matchmaking .
   docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=your_url business-matchmaking
   ```

## Docker Files Overview

### `Dockerfile` (Production)
- Multi-stage build for optimal image size
- Uses Node.js 18 Alpine Linux
- Optimized for production deployment
- Includes security best practices

### `Dockerfile.dev` (Development)
- Hot reload support
- Volume mounting for live code changes
- Development-optimized dependencies

### `docker-compose.yml`
- **app**: Production-ready service
- **app-dev**: Development service with hot reload
- Environment variable management
- Health checks included

### `.dockerignore`
- Excludes unnecessary files from build context
- Optimizes build performance
- Reduces final image size

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth (configure as needed)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## Development Workflow

### With Docker (Recommended for consistency)
```bash
# Start development environment
docker-compose --profile dev up

# View logs
docker-compose --profile dev logs -f

# Stop development environment
docker-compose --profile dev down
```

### Without Docker (Traditional)
```bash
npm install
npm run dev
```

## Production Deployment

### Using Docker Compose
```bash
# Start production environment
docker-compose up app -d

# Scale if needed
docker-compose up app -d --scale app=3

# View logs
docker-compose logs -f app
```

### Manual Docker Commands
```bash
# Build production image
docker build -t business-matchmaking:latest .

# Run with environment variables
docker run -d \
  --name business-matchmaking \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  --restart unless-stopped \
  business-matchmaking:latest
```

## Benefits of Docker Setup

1. **Environment Consistency**: Same setup across all machines
2. **Easy Onboarding**: New developers can start with one command
3. **Production Parity**: Development matches production environment
4. **Dependency Management**: No need to install Node.js locally
5. **Scalability**: Easy to scale with Docker Compose
6. **Security**: Non-root user in production container

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change ports in docker-compose.yml or stop conflicting service
   docker-compose --profile dev up
   ```

2. **Environment variables not loading:**
   - Ensure `.env.local` exists and has proper values
   - Check docker-compose.yml environment section

3. **Hot reload not working:**
   - Ensure volume mounts are correct in docker-compose.yml
   - Check file permissions

4. **Build fails:**
   ```bash
   # Clean and rebuild
   docker-compose --profile dev down
   docker system prune -f
   docker-compose --profile dev up --build
   ```

## Performance Tips

1. **Use multi-stage builds** (already configured)
2. **Leverage .dockerignore** (already configured)
3. **Use production Dockerfiles** for staging environments
4. **Monitor resource usage** with `docker stats`

## Security Considerations

- Environment variables are properly handled
- Non-root user in production container
- Security headers configured in next.config.ts
- No sensitive data in Docker images

## Support

For Docker-related issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all prerequisites are installed
4. Check port availability
