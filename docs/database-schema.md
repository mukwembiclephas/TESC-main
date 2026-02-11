# Database Schema

## Overview

This document outlines the database schema for the TESC system, including tables, relationships, and key constraints. The system uses PostgreSQL as its primary database.

## Core Tables

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    profile_picture VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20)
);
```

### Roles and Permissions
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    codename VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    content_type_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);
```

## Academic Schema

### Institutions
```sql
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(254),
    website VARCHAR(255),
    logo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(institution_id, code)
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_of_department_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, code)
);
```

### Programs and Courses
```sql
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    duration_years INTEGER NOT NULL,
    total_credits INTEGER NOT NULL,
    degree_type VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, code)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    hours_per_week INTEGER,
    is_core BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, code)
);

CREATE TABLE course_prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, prerequisite_course_id)
);
```

### Academic Sessions and Enrollments
```sql
CREATE TABLE academic_sessions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) NOT NULL, -- 'active', 'completed', 'withdrawn', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, program_id, status) WHERE status = 'active'
);

CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    academic_session_id INTEGER REFERENCES academic_sessions(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'enrolled', 'completed', 'dropped', etc.
    grade VARCHAR(2),
    grade_points DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, course_id, academic_session_id)
);
```

## Innovation Module

### Innovation Projects
```sql
CREATE TABLE innovation_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_statement TEXT,
    objectives TEXT,
    expected_outcomes TEXT,
    status VARCHAR(50) NOT NULL, -- 'draft', 'submitted', 'in_review', 'approved', 'rejected', 'in_progress', 'completed'
    start_date DATE,
    end_date DATE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES innovation_projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL, -- 'leader', 'member', 'mentor', 'advisor'
    joined_date DATE NOT NULL,
    left_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id, role)
);

CREATE TABLE project_milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES innovation_projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(50) NOT NULL, -- 'pending', 'in_progress', 'completed', 'delayed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Reporting and Analytics

### Report Definitions
```sql
CREATE TABLE report_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    query TEXT NOT NULL,
    parameters JSONB,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_executions (
    id SERIAL PRIMARY KEY,
    report_definition_id INTEGER REFERENCES report_definitions(id) ON DELETE CASCADE,
    executed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    parameters JSONB,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    result_file_path VARCHAR(512),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

## Audit Logging

### Audit Logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Indexing Strategy

### Recommended Indexes
```sql
-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Academic data
CREATE INDEX idx_enrollments_student ON enrollments(student_id, status);
CREATE INDEX idx_course_enrollments_enrollment ON course_enrollments(enrollment_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);

-- Innovation projects
CREATE INDEX idx_innovation_projects_status ON innovation_projects(status);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Performance optimization
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## Data Retention and Archiving

### Archiving Strategy
- Active data: Current and recent academic years
- Archived data: Older than 5 years
- Backup retention: 7 years

### Data Purging
- Soft delete for user accounts (30 days before permanent deletion)
- Anonymization of personal data for compliance
- Regular archive and purge jobs

## Data Migration

### Version Control
- Database schema changes are version controlled
- Migration scripts for all schema changes
- Rollback procedures for failed migrations

### Migration Process
1. Create migration script
2. Test in development environment
3. Deploy to staging for testing
4. Schedule production deployment during maintenance window
5. Backup before migration
6. Run migration
7. Verify data integrity
8. Update documentation
