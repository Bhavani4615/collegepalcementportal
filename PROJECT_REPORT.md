# B.Tech CSE Final Year Project Report
## Title: College Placement Portal

---

## 1. Abstract
The **College Placement Portal** is a web-based enterprise application designed to automate and streamline the campus recruitment process in educational institutions. The platform connects three primary stakeholders: **Students**, **Company Recruiters**, and the **Training & Placement Officer (TPO/Admin)**. By shifting from error-prone manual spreadsheets to a centralized, role-based platform, the portal automates job postings, validates student CGPA eligibility in real-time, facilitates PDF resume uploads, logs system-wide notification alerts, and schedules technical interviews. Developed using the React.js frontend library, Spring Boot backend framework, and MySQL database, the portal implements production-grade security including stateless JWT authentication, BCrypt password encryption, and SQL injection prevention.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Client Layer (React + Vite)
        A[Student Panel]
        B[Recruiter Panel]
        C[TPO Admin Panel]
    end

    subgraph Service Layer (Spring Boot Backend)
        D[JWT Auth Filter]
        E[Security Context]
        F[Controllers]
        G[Service Logic]
    end

    subgraph Data Layer (MySQL Database)
        H[users table]
        I[student_profiles table]
        J[company_profiles table]
        K[jobs table]
        L[applications table]
        M[interviews table]
        N[notifications table]
    end

    A -->|REST API Requests & JWT| D
    B -->|REST API Requests & JWT| D
    C -->|REST API Requests & JWT| D
    D --> E
    E --> F
    F --> G
    G -->|Hibernate ORM / JPA| H
    G -->|Hibernate ORM / JPA| I
    G -->|Hibernate ORM / JPA| J
    G -->|Hibernate ORM / JPA| K
    G -->|Hibernate ORM / JPA| L
    G -->|Hibernate ORM / JPA| M
    G -->|Hibernate ORM / JPA| N
```

---

## 3. System Modules

### 3.1 Student Module
* **Authentication**: Login and registration with fields matching student criteria.
* **Profile Management**: Maintain CGPA, branch, phone, skills, and upload PDF resumes.
* **Job Board**: View approved campus placement drives with search and keyword filters.
* **Eligibility Engine**: Automatic lock/unlock of job drives depending on CGPA requirements.
* **Application Tracker**: View current job applications and statuses (Applied, Shortlisted, Rejected, Offered).
* **Interviews Tab**: Real-time view of scheduled coding tests and interview schedules (times, links, notes).
* **Notifications**: Chronological user-specific updates.

### 3.2 Company Recruiter Module
* **Company Profiles**: Update corporate contact info, websites, and descriptions.
* **Job Drive Management**: Post new drives, configure locations, package (LPA), eligibility CGPA, and deadlines.
* **Applicant Center**: Inspect candidates, view branches, CGPAs, and download resumes.
* **Shortlist Workflow**: Shortlist candidates, reject applications, or extend job offers.
* **Interview Scheduler**: Set interview coordinates (dates, links) for shortlisted candidates.

### 3.3 Training & Placement Officer (TPO/Admin) Module
* **Dashboard Analytics**: Visual counters for active job drives, pending approvals, total applications, and registered students.
* **Approval Pipeline**: Inspect pending recruiter postings and approve or reject drives.
* **Student/Company Registries**: Access all registered profiles, search directories, and verify data.

---

## 4. API Documentation

All request and response bodies use JSON format.

### 4.1 Authentication Endpoint
* **Login User**
  * **URL**: `/api/auth/login`
  * **Method**: `POST`
  * **Request Body**:
    ```json
    {
      "email": "student1@university.edu",
      "password": "password123"
    }
    ```
  * **Success Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50MUB1...",
      "id": 4,
      "email": "student1@university.edu",
      "name": "Bhavani Kumar",
      "role": "STUDENT"
    }
    ```

### 4.2 Jobs Endpoint
* **Post Job Drive (Recruiter)**
  * **URL**: `/api/jobs`
  * **Method**: `POST`
  * **Headers**: `Authorization: Bearer <token>`
  * **Request Body**:
    ```json
    {
      "title": "React Developer Intern",
      "companyName": "Microsoft",
      "salaryPackage": "12 LPA",
      "location": "Bengaluru",
      "minCgpa": 7.5,
      "deadline": "2026-09-10"
    }
    ```

### 4.3 Application Endpoint
* **Apply for Drive (Student)**
  * **URL**: `/api/applications/apply/{jobId}`
  * **Method**: `POST`
  * **Headers**: `Authorization: Bearer <token>`
  * **Success Response (200 OK)**:
    ```json
    {
      "message": "Applied successfully to Microsoft!"
    }
    ```

---

## 5. Security Protocols
1. **Stateless JWT Security**: Avoids session cookies, protecting against CSRF (Cross-Site Request Forgery).
2. **Password Encryption**: All password credentials are hashed on registration using BCrypt with custom work factors (random salting).
3. **Role-Based Access Control (RBAC)**: Enforced via Spring Security's `@PreAuthorize("hasRole('...')")` annotations on controllers.
4. **Input Validation**: Hibernate validator intercepts payloads to check formats, non-empty fields, and valid decimal ranges.
5. **Secure PDF Upload**: Restricts uploads strictly to `application/pdf`, renaming files to prevent directory traversal and server code executions.

---

## 6. Functional Test Cases

| Test Case ID | Test Scenario | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Student Login with valid password | `student1@university.edu` / `password123` | Login success, JWT token returned, dashboard opens. | PASS |
| **TC-002** | Student Login with invalid password | `student1@university.edu` / `wrongpwd` | Login fails with HTTP 401 Unauthorized. | PASS |
| **TC-003** | Apply with lower CGPA | Job Min CGPA: `8.0`, Student CGPA: `7.2` | Application fails with eligibility error message. | PASS |
| **TC-004** | Upload non-PDF resume | File: `my_resume.exe` | Upload fails with HTTP 400 Bad Request. | PASS |
| **TC-005** | Recruiter schedules interview | App ID: `2`, Time: `2026-08-25T10:00:00` | Interview saved, notification generated for student. | PASS |
| **TC-006** | Unauthorized admin action | Student requests TPO pending drive list | Access denied with HTTP 403 Forbidden. | PASS |
