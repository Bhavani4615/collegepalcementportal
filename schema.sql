-- College Placement Portal Database Schema
-- DBMS: MySQL
-- Date: 2026-08-06

CREATE DATABASE IF NOT EXISTS placement_db;
USE placement_db;

-- 1. Table: users (Unified Authentication Table)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'STUDENT', 'RECRUITER', 'ADMIN'
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'PENDING', 'ACTIVE', 'INACTIVE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Table: student_profiles (Extended Profile for Students)
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id BIGINT PRIMARY KEY,
    cgpa DOUBLE DEFAULT 0.0,
    branch VARCHAR(100) DEFAULT NULL,
    resume_url VARCHAR(255) DEFAULT NULL,
    phone_number VARCHAR(20) DEFAULT NULL,
    skills VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Table: company_profiles (Extended Profile for Companies)
CREATE TABLE IF NOT EXISTS company_profiles (
    user_id BIGINT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    description TEXT,
    website VARCHAR(100),
    contact_number VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Table: jobs (Job Openings posted by Companies)
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    salary_package VARCHAR(50) NOT NULL, -- e.g. '12 LPA'
    location VARCHAR(100) DEFAULT 'Remote',
    min_cgpa DOUBLE DEFAULT 0.0,
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    recruiter_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Table: applications (Job applications by students)
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED', -- 'APPLIED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'
    resume_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_job (student_id, job_id)
) ENGINE=InnoDB;

-- 6. Table: interviews (Schedules for Shortlisted Applicants)
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    location VARCHAR(100) NOT NULL, -- 'Zoom Link', 'Room 302', etc.
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Table: notifications (For all users)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INDEXES for Optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);

-- ==========================================
-- SEED DATA (Password for all users: 'password123')
-- BCrypt Hash: $2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq
-- ==========================================

-- Seeding Users
INSERT INTO users (id, email, password, role, name, status) VALUES
(1, 'tpo@university.edu', '$2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq', 'ADMIN', 'Dr. Rajesh Sharma (TPO)', 'ACTIVE'),
(2, 'recruiter@microsoft.com', '$2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq', 'RECRUITER', 'Amit Verma (Microsoft Hr)', 'ACTIVE'),
(3, 'recruiter@google.com', '$2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq', 'RECRUITER', 'Sarah Jenkins (Google Recruiting)', 'ACTIVE'),
(4, 'student1@university.edu', '$2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq', 'STUDENT', 'Bhavani Kumar', 'ACTIVE'),
(5, 'student2@university.edu', '$2a$10$vKyw7G63Z/x4Gg8h4m65mef.lZ47J4h5j2sYnUjHlWJvNqMhB5wVq', 'STUDENT', 'Anjali Rao', 'ACTIVE');

-- Seeding Student Profiles
INSERT INTO student_profiles (user_id, cgpa, branch, resume_url, phone_number, skills) VALUES
(4, 8.75, 'Computer Science and Engineering', 'http://localhost:8080/api/resumes/download/resume_student1.pdf', '+91-9876543210', 'Java, React, MySQL, Spring Boot'),
(5, 7.20, 'Information Technology', 'http://localhost:8080/api/resumes/download/resume_student2.pdf', '+91-8765432109', 'Python, HTML, CSS, JavaScript');

-- Seeding Company Profiles
INSERT INTO company_profiles (user_id, company_name, description, website, contact_number) VALUES
(2, 'Microsoft', 'Leading global technology company specializing in cloud, AI, and software services.', 'https://microsoft.com', '+1-800-456-7890'),
(3, 'Google LLC', 'Global search engine giant operating in web services, hardware, and AI development.', 'https://google.com', '+1-800-555-0199');

-- Seeding Jobs
INSERT INTO jobs (id, title, description, company_name, salary_package, location, min_cgpa, deadline, status, recruiter_id) VALUES
(1, 'Software Engineer Intern', 'We are looking for self-motivated Software Engineering Interns proficient in data structures and object-oriented programming.', 'Microsoft', '15 LPA', 'Hyderabad', 8.0, '2026-09-30', 'APPROVED', 2),
(2, 'Cloud Solution Architect', 'Design and implement serverless cloud solutions. Expertise in Azure or AWS is highly desirable.', 'Microsoft', '24 LPA', 'Bengaluru', 7.5, '2026-10-15', 'PENDING', 2),
(3, 'Associate Software Engineer', 'Entry level software engineering position. Responsibility includes bug fixing, writing test cases, and feature development.', 'Google LLC', '32 LPA', 'Bengaluru / Pune', 8.5, '2026-08-30', 'APPROVED', 3);

-- Seeding Applications
INSERT INTO applications (id, job_id, student_id, status, resume_url) VALUES
(1, 1, 4, 'APPLIED', 'http://localhost:8080/api/resumes/download/resume_student1.pdf'),
(2, 3, 4, 'SHORTLISTED', 'http://localhost:8080/api/resumes/download/resume_student1.pdf'),
(3, 3, 5, 'REJECTED', 'http://localhost:8080/api/resumes/download/resume_student2.pdf');

-- Seeding Interviews
INSERT INTO interviews (id, application_id, scheduled_time, location, notes, status) VALUES
(1, 2, '2026-08-25 10:00:00', 'Zoom Meeting ID: 849 2038 1204', 'Technical Round 1 focusing on Coding, Data Structures and System Design.', 'SCHEDULED');

-- Seeding Notifications
INSERT INTO notifications (id, user_id, message, is_read) VALUES
(1, 4, 'Welcome to the College Placement Portal! Please complete your profile to apply for placement drives.', TRUE),
(2, 4, 'Your application for Associate Software Engineer at Google LLC has been shortlisted! Check interview details.', FALSE),
(3, 5, 'We regret to inform you that your application for Associate Software Engineer at Google LLC was rejected as it did not match eligibility criteria.', FALSE),
(4, 1, 'New Job Post "Cloud Solution Architect" requires approval from Microsoft recruiter.', FALSE);
