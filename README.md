# College Placement Portal

College Placement Portal is a production-grade, secure, and responsive web application designed to digitize and automate the placement process in academic institutions. Built using **React.js + Vite** on the frontend, **Spring Boot (Java)** on the backend, and **MySQL** as the primary datastore, it replaces manual spreadsheet management with streamlined workflows for Students, Corporate Recruiters, and Training & Placement Officers (TPOs).

---

## 🌟 Key Features

### 🎓 Student Module
* **JWT Security**: Secure credentials login and account registration.
* **Profile Management**: Keep contact lines, branch, CGPA, and technical skills updated.
* **PDF Resume Upload**: Direct file upload to server-side directories linked to the profile.
* **Placement Drives Board**: Search and filter active job opportunities.
* **Eligibility Blocker**: Disallows applications if the student's CGPA is below the recruiter's criteria.
* **Application Tracker**: View submission history and current status.
* **Interview Agenda**: View schedule, coordinates (e.g. Zoom links), and interviewer notes.
* **Notification Logs**: Read alerts about status updates (shortlists, rejections, offers).

### 🏢 Recruiter Module
* **Profile Configurations**: Manage corporate group credentials, websites, and descriptions.
* **Post Job Drives**: Define titles, salary packages (LPA), locations, deadlines, and eligibility CGPA.
* **Applicant Screening**: Review student metrics (branch, CGPA) and inspect uploaded PDF resumes.
* **Selection Workflow**: Single-click actions to shortlist, reject, or offer jobs to candidates.
* **Interview Scheduler**: Set interview rounds with datetime pickers and venue links.

### 💼 Admin (TPO) Module
* **Analytics Center**: Track key performance indicators (Active drives, pending reviews, total applications, registered students/companies).
* **Approval Pipeline**: Authorize or decline corporate job postings before they go live on the student board.
* **Registries**: Search directories of registered students and company partners.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (v19), Vite (v8), Axios, Context API, Vanilla CSS.
* **Backend**: Spring Boot (v3.2.5), Java 17, Spring Security (Role-Based Access Control), Hibernate/JPA.
* **Database**: MySQL Server.
* **Authentication**: Stateless JSON Web Tokens (JWT).
* **Password Security**: BCrypt with custom work factors (random salting).

---

## 📂 Directory Structure

```
collegeplacementportal/
├── backend/                        # Spring Boot Java Project
│   ├── pom.xml                     # Maven Dependencies Config
│   ├── src/main/
│   │   ├── java/com/placement/portal/
│   │   │   ├── PortalApplication.java # Spring Boot Entry Point
│   │   │   ├── config/             # CORS configuration
│   │   │   ├── controllers/        # REST Controllers (Auth, Job, Profile, Application...)
│   │   │   ├── dto/                # Data Transfer Objects (Request/Response models)
│   │   │   ├── models/             # Database Entities (User, StudentProfile, Job, Interview...)
│   │   │   ├── repositories/       # Spring Data JPA repositories
│   │   │   └── security/           # JWT Security filters & WebSecurityConfig
│   │   └── resources/
│   │       └── application.properties # Server, database & JWT properties config
│   └── target/                     # Built packaged JAR files
├── src/                            # React Frontend source code
│   ├── api.js                      # Centralized Axios client & API endpoints
│   ├── App.jsx                     # Route rendering & Layout
│   ├── App.css                     # Global styles & variables
│   ├── main.jsx                    # React mounting index
│   ├── index.css                   # Global reset & typography
│   └── components/                 # UI Views
│       ├── Login.jsx               # Auth forms (role-based)
│       ├── Login.css               # Styling for Login views
│       ├── StudentDashboard.jsx    # Student Portal & PDF Resume Upload
│       ├── RecruiterDashboard.jsx  # Recruiter Portal & Interview scheduling
│       ├── TpoDashboard.jsx        # Administrative pipeline & charts
│       └── Dashboards.css          # Shared dashboard layout variables
├── schema.sql                      # DDL statements & seed SQL script
├── SETUP_INSTRUCTIONS.md           # Local setup instructions
├── RESUME_DESCRIPTION.md           # Professional resume descriptions
├── VIVA_QUESTIONS.md               # Viva questions compilation
├── PROJECT_REPORT.md               # B.Tech CSE formal project report
├── PRESENTATION_OUTLINE.md         # PowerPoint slides layout
└── DEPLOYMENT_GUIDE.md             # Production VPS server installation guide
```

---

## 🚀 Quick Start Setup

For complete, detailed configurations, refer to the [Setup Instructions](file:///c:/project/collegepalcementportal/SETUP_INSTRUCTIONS.md).

1. **Database Setup**: Create a MySQL schema and run the seed script:
   ```bash
   mysql -u root -p < schema.sql
   ```
2. **Launch Backend**: Compile and run the Spring Boot API:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. **Launch Frontend**: Install npm packages and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`. Select your role, and login using standard seed passwords `password123`.

---

## 🔒 Security Measures

* **Salting Passwords**: Stored as salted BCrypt hashes to protect against reverse dictionary lookup attacks.
* **SQL Injection Blockers**: Built-in JPA parameterized statements sanitize queries.
* **XSS Prevention**: React dynamically escapes script injections.
* **Secure Uploads**: Verifies PDF content-types and maps filenames uniquely to prevent directory traversal exploits.

---

## 📖 Swagger API Documentation

When the Spring Boot backend is running, you can access the interactive Swagger UI to inspect and test all REST endpoints:
* **Interactive Web Console**: `http://localhost:8080/swagger-ui/index.html`
* **OpenAPI 3 JSON definition**: `http://localhost:8080/v3/api-docs`

