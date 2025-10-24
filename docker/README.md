# Portfolio Management Database - Docker Setup

This directory contains Docker configuration files for running the Portfolio Management Database with PostgreSQL, PgAdmin, and Redis.

## 🐳 Quick Start

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose v3.8+

### 1. Start the Database Stack

```bash
# Clone or download the repository
cd portfolio-management-db

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Access the Services

- **PostgreSQL Database**: `localhost:5432`
  - Database: `portfolio_management`
  - Username: `portfolio_user`
  - Password: `portfolio_password`

- **PgAdmin Web Interface**: http://localhost:8080
  - Email: `admin@portfolio.com`
  - Password: `admin123`

- **Redis Cache**: `localhost:6379`

### 3. Connect to Database

```bash
# Using psql command line
psql -h localhost -p 5432 -U portfolio_user -d portfolio_management

# Using Docker exec
docker exec -it portfolio_db psql -U portfolio_user -d portfolio_management
```

## 📁 Docker Files Structure

```
docker/
├── README.md              # This file
├── init-db.sh            # Database initialization script
└── Dockerfile            # Custom PostgreSQL image (optional)

docker-compose.yml        # Main Docker Compose configuration
```

## 🔧 Configuration

### Environment Variables

The Docker setup uses the following environment variables:

```yaml
# PostgreSQL Configuration
POSTGRES_DB: portfolio_management
POSTGRES_USER: portfolio_user
POSTGRES_PASSWORD: portfolio_password

# PgAdmin Configuration
PGADMIN_DEFAULT_EMAIL: admin@portfolio.com
PGADMIN_DEFAULT_PASSWORD: admin123
```

### Ports

- **5432**: PostgreSQL database
- **8080**: PgAdmin web interface
- **6379**: Redis cache

### Volumes

- `postgres_data`: PostgreSQL data persistence
- `pgadmin_data`: PgAdmin configuration persistence
- `redis_data`: Redis data persistence

## 🚀 Advanced Usage

### Custom Database Initialization

The database is automatically initialized with:
1. All schema files executed in order
2. Sample data loaded
3. Portfolio summaries calculated
4. Views and functions created

### Manual Database Operations

```bash
# Execute a single SQL file
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < schema/01_users.sql

# Run example queries
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/queries.sql

# Backup database
docker exec portfolio_db pg_dump -U portfolio_user portfolio_management > backup.sql

# Restore database
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < backup.sql
```

### Development Mode

For development with live schema changes:

```bash
# Start with live reloading
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Watch logs
docker-compose logs -f postgres

# Restart database with fresh data
docker-compose down -v
docker-compose up -d
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5432
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Permission Denied**
   ```bash
   # Make init script executable
   chmod +x docker/init-db.sh
   ```

3. **Database Connection Failed**
   ```bash
   # Check if container is running
   docker-compose ps
   
   # Check logs
   docker-compose logs postgres
   
   # Restart services
   docker-compose restart
   ```

4. **Data Not Persisting**
   ```bash
   # Check volume mounts
   docker volume ls
   
   # Remove volumes and restart (WARNING: This deletes data)
   docker-compose down -v
   docker-compose up -d
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs postgres
docker-compose logs pgadmin

# Follow logs in real-time
docker-compose logs -f postgres

# Check container status
docker-compose ps

# Check resource usage
docker stats
```

## 🔒 Security Considerations

### Production Deployment

For production use, consider:

1. **Change Default Passwords**
   ```yaml
   environment:
     POSTGRES_PASSWORD: your_secure_password
     PGADMIN_DEFAULT_PASSWORD: your_secure_password
   ```

2. **Use Secrets Management**
   ```yaml
   environment:
     POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
   secrets:
     postgres_password:
       file: ./secrets/postgres_password.txt
   ```

3. **Network Security**
   ```yaml
   networks:
     portfolio_network:
       driver: bridge
       ipam:
         config:
           - subnet: 172.20.0.0/16
   ```

4. **Resource Limits**
   ```yaml
   services:
     postgres:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
   ```

## 📊 Monitoring and Maintenance

### Health Checks

The setup includes health checks for PostgreSQL:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U portfolio_user -d portfolio_management"]
  interval: 30s
  timeout: 10s
  retries: 5
```

### Backup Strategy

```bash
# Create automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec portfolio_db pg_dump -U portfolio_user portfolio_management > "backup_${DATE}.sql"
```

### Performance Tuning

For better performance, consider:

1. **PostgreSQL Configuration**
   ```yaml
   command: >
     postgres
     -c shared_buffers=256MB
     -c effective_cache_size=1GB
     -c maintenance_work_mem=64MB
     -c checkpoint_completion_target=0.9
     -c wal_buffers=16MB
     -c default_statistics_target=100
   ```

2. **Resource Allocation**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
         cpus: '1.0'
   ```

## 🧪 Testing

### Run Tests

```bash
# Test database connection
docker exec portfolio_db psql -U portfolio_user -d portfolio_management -c "SELECT version();"

# Test sample data
docker exec portfolio_db psql -U portfolio_user -d portfolio_management -c "SELECT COUNT(*) FROM users;"

# Run example queries
docker exec -i portfolio_db psql -U portfolio_user -d portfolio_management < examples/queries.sql
```

### Load Testing

```bash
# Install pgbench for load testing
docker exec portfolio_db pgbench -i -s 10 portfolio_management
docker exec portfolio_db pgbench -c 10 -j 2 -t 1000 portfolio_management
```

## 📚 Additional Resources

- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [PgAdmin Docker Hub](https://hub.docker.com/r/dpage/pgadmin4)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes with `docker-compose up -d`
2. Verify all services start correctly
3. Test database initialization
4. Update documentation if needed
5. Consider backward compatibility