# Multi-Tenant SaaS Platform with Project & Task Management

## 📋 Overview

A production-ready, fully dockerized multi-tenant SaaS application built with Node.js, Express, React, and PostgreSQL. Features complete JWT authentication, role-based access control, multi-tenant data isolation, and comprehensive project and task management capabilities.

## ✨ Key Features

- **Multi-Tenancy**: Complete data isolation between tenants with tenant-based access control
- **JWT Authentication**: Secure token-based authentication and authorization
- **Role-Based Access Control (RBAC)**: Admin, User, and Super Admin roles
- **Project Management**: Create, read, update, and delete projects with full CRUD operations
- **Task Management**: Task assignment, status tracking, and team collaboration
- **Team Management**: Manage team members with role-based permissions
- **Docker Containerization**: Complete Docker and Docker Compose setup for easy deployment
- **Database Persistence**: PostgreSQL with automatic migrations and seed data
- **Health Checks**: Built-in health check endpoints and service monitoring
- **Auto-Initialization**: Database migrations and seed data load automatically on startup

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Port 3000 (Frontend), 5000 (Backend), 5432 (Database) available

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/KvPradeepthi/multi-tenant-saas-platform.git
cd multi-tenant-saas-platform

# Start all services with Docker Compose
docker-compose up -d

# Wait for services to initialize (30-45 seconds)
# Check health status
curl http://localhost:5000/api/v1/health
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/v1/health
- **PostgreSQL Database**: localhost:5432

## 🔑 Test Credentials

### Super Admin
- **Email**: superadmin@example.com
- **Password**: test_password_superadmin
- **Role**: super_admin

### Tenant 1 Admin
- **Email**: admin@tenant1.com
- **Password**: test_password_admin1
- **Company**: Tenant 1 Corp
- **Tenant ID**: tenant_1
- **Role**: admin

### Tenant 1 User
- **Email**: user1@tenant1.com
- **Password**: test_password_user1
- **Company**: Tenant 1 Corp
- **Tenant ID**: tenant_1
- **Role**: user

### Tenant 2 Admin
- **Email**: admin@tenant2.com
- **Password**: test_password_admin2
- **Company**: Tenant 2 Inc
- **Tenant ID**: tenant_2
- **Role**: admin

## 📂 Project Structure

```
multi-tenant-saas-platform/
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── Dockerfile
│   └── index.html
├── database/
│   ├── init.sql
│   └── seed.sql
├── docs/
│   ├── research.md
│   ├── PRD.md
│   ├── architecture.md
│   ├── technical-spec.md
│   ├── API.md
│   └── images/
├── docker-compose.yml
├── submission.json
└── README.md
```

## 🏗️ Architecture

### Three-Tier Architecture
1. **Frontend Tier**: Static HTML/CSS/JavaScript served via Nginx on port 3000
2. **Backend Tier**: Node.js/Express API on port 5000
3. **Database Tier**: PostgreSQL on port 5432

### Multi-Tenancy Implementation
- Each user belongs to a tenant
- All database queries filtered by tenant_id
- JWT tokens contain tenant_id for authorization
- Complete data isolation between tenants

## 🔐 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Project Endpoints (19 total)
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Task Endpoints
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/projects/:project_id/tasks` - Get tasks by project
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### Team Management
- `GET /api/v1/team` - List team members
- `POST /api/v1/team` - Add team member
- `PUT /api/v1/team/:id` - Update team member
- `DELETE /api/v1/team/:id` - Remove team member

### User Management
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update user profile

### System Endpoints
- `GET /api/v1/health` - Health check endpoint

## 🗄️ Database Schema

### Users Table
- Multi-tenant user management
- Password hashing with bcrypt
- Tenant isolation via tenant_id

### Projects Table
- Project ownership and management
- Tenant-scoped projects
- Status tracking

### Tasks Table
- Task assignment and tracking
- Project association
- Status management

### Team Members Table
- Team collaboration
- Role-based team management
- Tenant-based team isolation

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3
- **Logic**: Vanilla JavaScript
- **Server**: Nginx (Alpine)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Base Images**: Node:18-Alpine, Nginx:Alpine, Postgres:15

## 📋 API Response Format

All endpoints return consistent JSON responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## 🔄 Database Initialization

### Automatic Startup
1. Database container starts
2. `init.sql` runs automatically via docker-entrypoint-initdb.d
3. Tables created
4. Backend container waits for database health check
5. `entrypoint.sh` runs migrations
6. `seed.sql` loads sample data
7. Backend API starts

### Manual Seeding (if needed)
```bash
docker-compose exec backend psql -h database -U saas_user -d saas_platform < database/seed.sql
```

## 🧪 Testing the Application

### Test Multi-Tenancy
1. Register/login as admin@tenant1.com
2. Create a project in Tenant 1
3. Create a task in Tenant 1 project
4. Switch to admin@tenant2.com
5. Verify projects from Tenant 1 are NOT visible

### Test Authentication
```bash
# Get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tenant1.com","password":"test_password_admin1"}'

# Use token in requests
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/v1/projects
```

## 🛑 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs database
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Verify database is healthy
curl http://localhost:5000/api/v1/health

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Change ports in docker-compose.yml or kill processes
sudo lsof -i :3000  # Check what's using port 3000
```

## 📖 Documentation

- **[API Documentation](./docs/API.md)** - Detailed API endpoint documentation
- **[Architecture](./docs/architecture.md)** - System design and database ERD
- **[Product Requirements](./docs/PRD.md)** - Functional and non-functional requirements
- **[Research & Analysis](./docs/research.md)** - Multi-tenancy analysis and design decisions
- **[Technical Specification](./docs/technical-spec.md)** - Development setup and configuration

## 👥 Roles & Permissions

### Super Admin
- Full system access
- Can manage all tenants
- View system-wide analytics

### Tenant Admin
- Manage all projects and tasks in their tenant
- Manage team members
- Invite users to tenant

### User
- View assigned projects and tasks
- Create tasks
- Update own profile
- Collaborate with team members

## 🔐 Security Features

- JWT-based stateless authentication
- Bcrypt password hashing (10 salt rounds)
- Tenant-level data isolation
- Input validation and error handling
- SQL injection prevention via parameterized queries
- CORS-enabled for cross-origin requests

## 📝 License

MIT License - feel free to use this project for learning and development

## 👨‍💻 Author

**KvPradeepthi** - Full-stack developer

## 🎬 Demo Video

Watch the full platform demonstration: [YouTube Demo Link]

## 📞 Support

For issues or questions:
1. Check the [API Documentation](./docs/API.md)
2. Review the [Technical Specification](./docs/technical-spec.md)
3. Check Docker logs: `docker-compose logs [service-name]`
