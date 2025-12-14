# Cos-Theta Docker Setup

This directory contains the Docker Compose configuration for running all Cos-Theta services together.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

1. **Create a `.env` file** in the `docker` directory:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual values:
   - Set `JWT_SECRET` and `JWT_REFRESH_TOKEN_SECRET` to secure random strings
   - Set `EMAIL` and `EMAIL_PASSWORD` for your Gmail account (use App Password)
   - Set `FRONTEND_URL` to your frontend URL

3. **Start all services**:
   ```bash
   cd docker
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

5. **Stop all services**:
   ```bash
   docker-compose down
   ```

## Services

The Docker Compose file includes:

- **MongoDB** (Port 27017) - Database
- **User Service** (Port 9001) - Authentication and user management
- **Core Service** (Port 9002) - Main business logic (teams, projects, etc.)
- **Socket Service** (Port 9003) - WebSocket server for real-time features
- **Notification Service** (Port 9004) - Notifications and comments
- **Frontend App** (Port 3000) - Main application frontend
- **Frontend Home** (Port 3001) - Landing page frontend

## Environment Variables

All services share common environment variables:
- `MONGO_URI` - Automatically set to connect to the MongoDB container
- `JWT_SECRET` - From your `.env` file
- `JWT_REFRESH_TOKEN_SECRET` - From your `.env` file
- `EMAIL` - From your `.env` file
- `EMAIL_PASSWORD` - From your `.env` file
- `FRONTEND_URL` - From your `.env` file

### Frontend API URLs

The frontend Dockerfile has been updated to accept build-time environment variables for API URLs. These are set in the docker-compose.yaml file:
- `NEXT_PUBLIC_USER_SERVICE_API` - http://localhost:9001/api/v1
- `NEXT_PUBLIC_CORE_SERVICE_API` - http://localhost:9002/api/v1
- `NEXT_PUBLIC_SOCKET_SERVICE_API` - http://localhost:9003
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_API` - http://localhost:9004

**Note:** If your frontend uses a `constant.ts` file with hardcoded URLs, you may need to update it to use these environment variables instead, or modify the docker-compose.yaml to match your current setup.

## Useful Commands

```bash
# Start services in background
docker-compose up -d

# Start services and view logs
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker-compose down -v

# Rebuild services after code changes
docker-compose up -d --build

# View logs for a specific service
docker-compose logs -f user-service

# Restart a specific service
docker-compose restart user-service

# Execute a command in a running container
docker-compose exec user-service sh
```

## Troubleshooting

### Services won't start
- Check if ports are already in use
- Ensure MongoDB is healthy before other services start
- Check logs: `docker-compose logs`

### Database connection issues
- Wait for MongoDB to be healthy (healthcheck runs every 10s)
- Check MongoDB logs: `docker-compose logs mongodb`

### Frontend can't connect to services
- Ensure all backend services are running
- Check that environment variables are set correctly
- Verify network connectivity: `docker network inspect docker_cos-theta-network`

## Development vs Production

For production, you should:
1. Use strong, unique secrets for JWT keys
2. Use environment-specific MongoDB credentials
3. Set up proper SSL/TLS certificates
4. Use a reverse proxy (nginx/traefik) for routing
5. Set up proper backup strategies for MongoDB
6. Use Docker secrets or a secrets manager instead of `.env` files

