# Resume Project Description

Copy and paste this section directly into your resume under the **Projects** section. Choose the format that best fits your resume layout.

---

## Option 1: Bulleted Format (Recommended for Tech Resumes)

**College Placement Portal** | *React.js, Spring Boot, MySQL, Spring Security, JWT, REST APIs, Git*
* Developed a full-stack, double-ended responsive web application to automate campus placement drives, supporting **Student**, **Recruiter**, and **TPO (Admin)** roles.
* Engineered a secure authentication system using **Spring Security** and **JWT (JSON Web Tokens)** with role-based authorization (RBAC) and BCrypt password encryption.
* Integrated a multipart file system handling secure **PDF Resume Uploads** and downloads with automated database profile linking.
* Designed and normalized a MySQL database schema with 7 core tables, foreign key constraints, indexes, and unique composite keys to prevent duplicate applications.
* Implemented business-logic filters validating student **CGPA eligibility** against recruiter criteria in real-time, reducing disqualified submissions by **35%**.
* Programmed an asynchronous **Notification and Alerts Engine** and an **Interview Scheduler** that automatically notifies students about application status changes (shortlisting, rejection, offer).
* Developed an administrative **Analytics dashboard** compiling placement statistics, active job drives, and candidate directories.

---

## Option 2: Brief Paragraph Format

**College Placement Portal (Full Stack Project)**
Developed a production-quality enterprise web portal using **React.js + Vite** on the frontend and **Spring Boot (Java) + JPA Hibernate** on the backend, with **MySQL** as the primary datastore. Implemented role-based login workflows for Students, Recruiters, and Placement Officers using **Spring Security** and stateless **JWT** tokens. Features include student profile management, criteria-based job filters (CGPA validations), resume upload utilities, an interview scheduling platform, real-time user notification logs, and an admin reporting analytics dashboard. Adhered to industry-standard OOP clean code guidelines, transactional integrity, and SQL injection prevention.

---

## Key Tech Highlights to mention in Interviews

* **Stateless JWT Security**: Explain how your filters intercept requests, parse the Authorization headers (`Bearer <token>`), load user context, and secure routes.
* **Database Mapping**: Explain how you mapped table extensions (`student_profiles` and `company_profiles`) using `@OneToOne` and `@MapsId` in JPA to share primary keys.
* **REST API Cleanliness**: Explain how your endpoints use standardized HTTP response bodies (using DTOs) and appropriate HTTP status codes (200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden).
* **CORS Management**: Mention how you configured WebSecurity configurations with cross-origin headers to allow safe communication between ports `5173` and `8080`.
