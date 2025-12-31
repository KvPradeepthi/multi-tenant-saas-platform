# Technical Specification

## Project Setup & Development Guide

### Prerequisites

- Docker Desktop (v20.10 or later)
- Docker Compose (v1.29 or later)
- Git
- A terminal/command line interface

### Docker Setup Instructions

#### Step 1: Clone the Repository

```bash
git clone https://github.com/KvPradeepthi/multi-tenant-saas-platform.git
cd multi-tenant-saas-platform
```

#### Step 2: Start All Services

```bash
docker-compose up -d
```

This single command will:
1. Pull required Docker images
2. Create the saas-network bridge network
3. Start the PostgreSQL database container
4. Initialize database with init.sql
5. Load seed data from seed.sql
6. Start the Node.js backend container
7. Start the Nginx frontend container

#### Step 3: Verify Services Are Running

```bash
# Check running containers
docker-compose ps

# Check health status
curl http://localhost:5000/api/v1/health
```

#### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/v1/health
- **Database:** localhost:5432

### Environment Configuration

All environment variables are defined in docker-compose.yml:

```yaml
database:
  environment:
    POSTGRES_DB: saas_platform
    POSTGRES_USER: saas_user
    POSTGRES_PASSWORD: secure_password_123

backend:
  environment:
    DB_HOST: database
    DB_PORT: 5432
    DB_NAME: saas_platform
    DB_USER: saas_user
    DB_PASSWORD: secure_password_123
    JWT_SECRET: your_jwt_secret_key_change_in_production
    NODE_ENV: production
```

### Project Structure

```
multi-tenant-saas-platform/
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── entrypoint.sh          # Startup script with DB migrations
│   ├── server.js              # Main Express.js application
│   ├── package.json           # Node.js dependencies
│   └── database/              # Database migration files
├── frontend/
│   ├── Dockerfile             # Frontend container definition
│   ├── index.html             # Main HTML file
│   ├── style.css              # Styling
│   └── app.js                 # Frontend logic
├── database/
│   ├── init.sql               # Schema initialization
│   └── seed.sql               # Test data
├── docs/
│   ├── API.md                 # API documentation
│   ├── architecture.md        # System architecture
│   ├── PRD.md                 # Product requirements
│   ├── research.md            # Research & analysis
│   └── technical-spec.md      # This file
├── docker-compose.yml         # Docker Compose configuration
├── README.md                  # Project overview
├── submission.json            # Task submission with credentials
└── .env                       # Environment variables
```

### Dockerfile Details

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./
COPY database ./database/
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1
ENTRYPOINT ["./entrypoint.sh"]
```

#### Frontend Dockerfile

```dockerfile
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY . /usr/share/nginx/html/
RUN echo 'server { listen 3000; server_name localhost; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Database Initialization

The init.sql file creates all necessary tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  tenant_id VARCHAR(50) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Similar tables for projects, tasks, team_members
-- with tenant_id field for multi-tenancy isolation
```

### API Endpoints Summary

**19 Total Endpoints:**

- Authentication: 2 endpoints
- Projects: 5 endpoints
- Tasks: 5 endpoints
- Team Management: 4 endpoints
- Users: 2 endpoints
- Health: 1 endpoint

### Troubleshooting

#### Services won't start
```bash
# Check logs
docker-compose logs database
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

#### Port already in use
```bash
# Change ports in docker-compose.yml or
# Kill processes using those ports
```

#### Database connection errors
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

### Performance Optimization

- Database indexes on tenant_id, user_id, project_id
- Connection pooling with pg library
- Multi-stage Docker builds for smaller images
- Nginx caching for static assets

### Security Best Practices

- JWT tokens for stateless authentication
- bcryptjs for password hashing (10 rounds)
- Parameterized queries to prevent SQL injection
- CORS security headers
- Tenant-level data isolation at query level
- Input validation and sanitization

### Production Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Update database credentials
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure load balancer
- [ ] Review security headers
- [ ] Set up CI/CD pipeline
- [ ] Test disaster recovery

### Technology Stack Details

- **Node.js:** v18 Alpine (lightweight runtime)
- **Express.js:** 4.x (minimal web framework)
- **PostgreSQL:** 15 (robust relational database)
- **Docker:** Container platform
- **Nginx:** Web server and reverse proxy
- **JWT:** Token-based authentication
- **bcryptjs:** Password hashing library
