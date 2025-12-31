-- Seed data for multi-tenant SaaS platform
-- Super Admin User
INSERT INTO users (email, password_hash, company_name, tenant_id, role) VALUES
('superadmin@example.com', '$2a$10$hashed_password_superadmin', 'Super Admin Company', 'super_admin', 'super_admin');

-- Tenant 1 Admin
INSERT INTO users (email, password_hash, company_name, tenant_id, role) VALUES
('admin@tenant1.com', '$2a$10$hashed_password_admin1', 'Tenant 1 Corp', 'tenant_1', 'admin'),
('user1@tenant1.com', '$2a$10$hashed_password_user1', 'Tenant 1 Corp', 'tenant_1', 'user'),
('user2@tenant1.com', '$2a$10$hashed_password_user2', 'Tenant 1 Corp', 'tenant_1', 'user');

-- Tenant 2 Admin
INSERT INTO users (email, password_hash, company_name, tenant_id, role) VALUES
('admin@tenant2.com', '$2a$10$hashed_password_admin2', 'Tenant 2 Inc', 'tenant_2', 'admin'),
('user3@tenant2.com', '$2a$10$hashed_password_user3', 'Tenant 2 Inc', 'tenant_2', 'user');

-- Sample Projects for Tenant 1
INSERT INTO projects (name, description, tenant_id, created_by, status) VALUES
('Project Alpha', 'Main project for Tenant 1', 'tenant_1', 2, 'active'),
('Project Beta', 'Secondary project for Tenant 1', 'tenant_1', 2, 'active');

-- Sample Projects for Tenant 2
INSERT INTO projects (name, description, tenant_id, created_by, status) VALUES
('Project Gamma', 'Main project for Tenant 2', 'tenant_2', 5, 'active');

-- Sample Tasks for Project Alpha (Tenant 1)
INSERT INTO tasks (project_id, title, description, assigned_to, tenant_id, created_by, status) VALUES
(1, 'Setup Database', 'Initialize and configure PostgreSQL', 3, 'tenant_1', 2, 'completed'),
(1, 'Design API', 'Design REST API endpoints', 4, 'tenant_1', 2, 'in_progress'),
(1, 'Frontend Development', 'Build React frontend', 3, 'tenant_1', 2, 'pending');

-- Sample Tasks for Project Beta (Tenant 1)
INSERT INTO tasks (project_id, title, description, assigned_to, tenant_id, created_by, status) VALUES
(2, 'Documentation', 'Write comprehensive docs', 4, 'tenant_1', 2, 'pending');

-- Sample Tasks for Project Gamma (Tenant 2)
INSERT INTO tasks (project_id, title, description, assigned_to, tenant_id, created_by, status) VALUES
(3, 'Backend Setup', 'Setup Node.js backend', 6, 'tenant_2', 5, 'in_progress');

-- Sample Team Members
INSERT INTO team_members (email, role, tenant_id, created_by) VALUES
('dev1@tenant1.com', 'developer', 'tenant_1', 2),
('dev2@tenant1.com', 'developer', 'tenant_1', 2),
('manager@tenant2.com', 'manager', 'tenant_2', 5);
