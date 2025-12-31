# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                   │
│  (HTML5, CSS3, Vanilla JavaScript on Nginx)         │
│         Port: 3000                                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────┐
│                   Backend Layer                     │
│     (Node.js + Express.js API)                      │
│         Port: 5000                                  │
│  - JWT Authentication & Authorization              │
│  - Request Validation                               │
│  - Business Logic                                   │
└──────────────────┬──────────────────────────────────┘
                   │ TCP
┌──────────────────▼──────────────────────────────────┐
│                 Database Layer                      │
│        (PostgreSQL 15)                              │
│         Port: 5432                                  │
│  - User Management                                  │
│  - Project & Task Storage                           │
│  - Team Member Data                                 │
│  - Tenant Isolation via tenant_id                   │
└─────────────────────────────────────────────────────┘
```

## Three-Tier Architecture

### 1. Presentation Layer (Frontend)
- Vanilla HTML5/CSS3/JavaScript
- Responsive user interface
- No build pipeline required
- Nginx web server on port 3000

### 2. Business Logic Layer (Backend)
- Node.js runtime with Express.js framework
- RESTful API architecture
- JWT-based authentication
- Multi-tenancy enforcement at query level
- Port 5000

### 3. Data Layer (Database)
- PostgreSQL 15 database server
- Normalized schema with 3NF
- Tenant-aware queries
- Port 5432

## Database Schema

### Tables

#### users
- id (PK)
- email (UNIQUE)
- password_hash
- company_name
- tenant_id (FK) - TENANT ISOLATION
- role (super_admin, admin, user)
- created_at, updated_at

#### projects
- id (PK)
- name
- description
- tenant_id (FK) - TENANT ISOLATION
- created_by (FK to users)
- status
- created_at, updated_at

#### tasks
- id (PK)
- project_id (FK to projects)
- title
- description
- assigned_to (FK to users)
- tenant_id (FK) - TENANT ISOLATION
- created_by (FK to users)
- status
- created_at, updated_at

#### team_members
- id (PK)
- email
- role
- tenant_id (FK) - TENANT ISOLATION
- created_by (FK to users)
- created_at, updated_at

## Multi-Tenancy Implementation

All queries filter by tenant_id from JWT token:
```sql
SELECT * FROM projects WHERE tenant_id = $1 AND id = $2
```

This ensures:
- Complete data isolation
- No cross-tenant data access
- Scalable multi-tenancy model

## API Layer Design

### Request/Response Flow
1. Client sends HTTP request to /api/v1/endpoint
2. Middleware validates JWT token
3. Extract tenant_id from token payload
4. Execute business logic
5. Query database with tenant filter
6. Return JSON response

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Deployment Architecture

### Docker Containers
- **database:** PostgreSQL 15 container
- **backend:** Node.js container with entrypoint.sh
- **frontend:** Nginx container with static files

### Network
- Internal bridge network: saas-network
- Container-to-container communication via service names
- External access via mapped ports

### Volumes
- postgres_data: Persistent database storage
- Volume mount for database initialization

## Security Architecture

### Authentication
- JWT tokens with user_id and tenant_id
- No session storage
- Stateless design for horizontal scaling

### Authorization
- Role-based access control (RBAC)
- Query-level tenant filtering
- Field-level access control possible

### Password Security
- bcryptjs with 10 salt rounds
- Never store plain text passwords
- Password hashing on registration and login

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Load balancer in front of multiple backend instances
- Shared database connection pool

### Performance Optimization
- Database indexes on tenant_id, user_id
- Connection pooling
- Query optimization

## Health Checks

### Backend Health Check
- GET /api/v1/health
- Database connectivity verification
- Response status determines container health

### Docker HEALTHCHECK
- Periodic HTTP request to health endpoint
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

## Future Architecture Improvements

1. **Caching Layer:** Redis for session and data caching
2. **Message Queue:** RabbitMQ for async task processing
3. **Microservices:** Split backend into service modules
4. **API Gateway:** Kong or Nginx Plus for rate limiting
5. **Monitoring:** Prometheus + Grafana for metrics
6. **Logging:** ELK stack for centralized logging
