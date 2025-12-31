# API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {}
}
```

## Endpoints

### Authentication (2 endpoints)

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "company_name": "My Company"
}
```

#### POST /auth/login
Login and receive JWT token
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Projects (5 endpoints)

#### GET /projects
Get all projects for authenticated user's tenant

#### POST /projects
Create new project
```json
{
  "name": "Project Name",
  "description": "Project description"
}
```

#### GET /projects/:id
Get specific project

#### PUT /projects/:id
Update project
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}
```

#### DELETE /projects/:id
Delete project

### Tasks (5 endpoints)

#### GET /tasks
Get all tasks for tenant

#### POST /tasks
Create task
```json
{
  "project_id": 1,
  "title": "Task Title",
  "description": "Task description",
  "assigned_to": 2
}
```

#### GET /projects/:project_id/tasks
Get tasks by project

#### PUT /tasks/:id
Update task

#### DELETE /tasks/:id
Delete task

### Team Members (4 endpoints)

#### GET /team
Get team members

#### POST /team
Add team member

#### PUT /team/:id
Update team member

#### DELETE /team/:id
Remove team member

### Users (2 endpoints)

#### GET /users/:id
Get user profile

#### PUT /users/:id
Update user profile

### Health (1 endpoint)

#### GET /health
Check API health status

## HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```
