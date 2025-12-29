const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'saas_platform',
  user: process.env.DB_USER || 'saas_user',
  password: process.env.DB_PASSWORD || 'secure_password_123',
});

app.use(express.json());

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.json({ success: false, message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.json({ success: false, message: 'Invalid token' });
  }
};

// API 1: Register User
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, company_name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, company_name, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, company_name, Math.random().toString(36).substr(2, 9)]
    );
    res.json({ success: true, message: 'User registered', data: { user_id: result.rows[0].id } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 2: Login User
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.json({ success: false, message: 'User not found' });
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.json({ success: false, message: 'Invalid password' });
    
    const token = jwt.sign({ user_id: user.id, tenant_id: user.tenant_id }, process.env.JWT_SECRET || 'test_secret');
    res.json({ success: true, message: 'Login successful', data: { token, user_id: user.id } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 3: Get User Profile
app.get('/api/v1/users/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    res.json({ success: true, message: 'User found', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 4: Update User
app.put('/api/v1/users/:id', verifyToken, async (req, res) => {
  try {
    const { company_name, phone } = req.body;
    const result = await pool.query(
      'UPDATE users SET company_name = $1, phone = $2 WHERE id = $3 AND tenant_id = $4 RETURNING *',
      [company_name, phone, req.params.id, req.user.tenant_id]
    );
    res.json({ success: true, message: 'User updated', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 5: Create Project
app.post('/api/v1/projects', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description, tenant_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, req.user.tenant_id, req.user.user_id]
    );
    res.json({ success: true, message: 'Project created', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 6: Get Projects
app.get('/api/v1/projects', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE tenant_id = $1', [req.user.tenant_id]);
    res.json({ success: true, message: 'Projects retrieved', data: result.rows });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 7: Get Single Project
app.get('/api/v1/projects/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    res.json({ success: true, message: 'Project found', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 8: Update Project
app.put('/api/v1/projects/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2, status = $3 WHERE id = $4 AND tenant_id = $5 RETURNING *',
      [name, description, status, req.params.id, req.user.tenant_id]
    );
    res.json({ success: true, message: 'Project updated', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 9: Delete Project
app.delete('/api/v1/projects/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 10: Create Task
app.post('/api/v1/tasks', verifyToken, async (req, res) => {
  try {
    const { project_id, title, description, assigned_to } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (project_id, title, description, assigned_to, tenant_id, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [project_id, title, description, assigned_to, req.user.tenant_id, req.user.user_id]
    );
    res.json({ success: true, message: 'Task created', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 11: Get Tasks
app.get('/api/v1/tasks', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE tenant_id = $1', [req.user.tenant_id]);
    res.json({ success: true, message: 'Tasks retrieved', data: result.rows });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 12: Get Task by Project
app.get('/api/v1/projects/:project_id/tasks', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE project_id = $1 AND tenant_id = $2', [req.params.project_id, req.user.tenant_id]);
    res.json({ success: true, message: 'Tasks retrieved', data: result.rows });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 13: Update Task
app.put('/api/v1/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, status, assigned_to } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, assigned_to = $4 WHERE id = $5 AND tenant_id = $6 RETURNING *',
      [title, description, status, assigned_to, req.params.id, req.user.tenant_id]
    );
    res.json({ success: true, message: 'Task updated', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 14: Delete Task
app.delete('/api/v1/tasks/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 15: Create Team Member
app.post('/api/v1/team', verifyToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    const result = await pool.query(
      'INSERT INTO team_members (email, role, tenant_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, role, req.user.tenant_id, req.user.user_id]
    );
    res.json({ success: true, message: 'Team member added', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 16: Get Team Members
app.get('/api/v1/team', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members WHERE tenant_id = $1', [req.user.tenant_id]);
    res.json({ success: true, message: 'Team members retrieved', data: result.rows });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 17: Update Team Member
app.put('/api/v1/team/:id', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    const result = await pool.query(
      'UPDATE team_members SET role = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [role, req.params.id, req.user.tenant_id]
    );
    res.json({ success: true, message: 'Team member updated', data: result.rows[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 18: Delete Team Member
app.delete('/api/v1/team/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
    res.json({ success: true, message: 'Team member removed' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// API 19: Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { status: 'running' } });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
