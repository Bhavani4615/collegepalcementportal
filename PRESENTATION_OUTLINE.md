# Project Presentation (PPT) Outline
## College Placement Portal

Use this slide-by-slide outline to create your presentation slides for your project viva or demo.

---

### Slide 1: Title Slide
* **Slide Title**: College Placement Portal
* **Subtitle**: Integrated Full-Stack Web Application for Campus Recruitment
* **Presenter Names**: [Your Name & Roll Number]
* **Guide Name**: [Project Guide's Name]
* **Institution Logo**: [University Name]

---

### Slide 2: Problem Statement
* **Manual Bottlenecks**:
  * Reliance on fragmented spreadsheets (Excel) for student data and job tracking.
  * Inefficient coordination between Training & Placement Officers (TPOs) and corporate recruiters.
  * Lack of real-time eligibility checks (resulting in students with lower CGPA applying for jobs they don't qualify for).
  * Inability of recruiters to download student resumes in bulk or schedule interviews dynamically.
  * Delayed communication of shortlist status or test coordinates to candidates.

---

### Slide 3: Proposed Solution
* **Integrated Portal**:
  * Unified, responsive platform supporting three user profiles (Student, Recruiter, TPO).
  * Real-time automated **CGPA Eligibility Verification Engine**.
  * Dynamic **PDF Resume Uploading** directly to the server database.
  * Automated **Recruiting Workflow**: Recruiters post drives -> TPO approves -> Students apply -> Recruiters shortlist/reject -> Interview scheduling.
  * Stateless instant **Notifications Logging system** to dismiss alerts.

---

### Slide 4: Technology Stack
* **Frontend Layer**: React.js, Vite, Axios (API requests), Context API, CSS Variable Styling.
* **Backend Layer**: Spring Boot (Java), Spring Security, Hibernate ORM, Spring Data JPA.
* **Database Layer**: MySQL (Relational DBMS).
* **Protocols**: REST API architecture, JWT (JSON Web Tokens) stateless authentication, BCrypt password hashing.

---

### Slide 5: System Architecture Diagram
* *Embed a screenshot of the architecture diagram from `PROJECT_REPORT.md` here.*
* **Data Flow Highlights**:
  * Client-side React routing protects dashboards based on JWT roles.
  * Spring Security intercepts requests using `AuthTokenFilter` to check bearer tokens.
  * Hibernate maps entities directly to MySQL tables without writing SQL queries.

---

### Slide 6: Database Design (Entity-Relationship)
* **Tables Structure**:
  * `users` (Core Auth table: ID, Email, Hash, Role, Status)
  * `student_profiles` (One-to-One with Users: Branch, CGPA, Phone, PDF Link)
  * `company_profiles` (One-to-One with Users: Company details)
  * `jobs` (Many-to-One with Recruiters: Min CGPA, deadline, package, status)
  * `applications` (Many-to-Many join table: Job, Student, Apply date, application status)
  * `interviews` (Many-to-One with Applications: Date/time, venue/link, notes)
  * `notifications` (Many-to-One with Users: Message alerts log)
* **Optimization**: Custom indexes on `email` and `status` columns for search speeds.

---

### Slide 7: Implementation Details - Security
* **JWT Stateless Flow**:
  * Explain how a signed token is generated upon login and passed in headers.
* **BCrypt Hashing**:
  * Explain password hashing with salting to block dictionary attacks.
* **SQL Injection & XSS Protections**:
  * JPA parameterized statements render input fields safe from database injections.
  * React's JSX auto-escapes code strings to prevent Cross-Site Scripting (XSS).

---

### Slide 8: Key Features Demo (Screenshots / Walkthrough)
* **Student Dashboard**: Shows active drives, profile updating, and resume upload.
* **Recruiter Dashboard**: Shows job creation form, applicant details, shortlisting actions, and interview scheduling.
* **TPO Dashboard**: Shows pending drive lists, approve/decline toggles, and system-wide analytic directories.

---

### Slide 9: Project Achievements & Conclusion
* **Key Achievements**:
  * Successfully automated placement operations, reducing paperwork by **100%**.
  * Implemented strict criteria-based application lockouts, decreasing manual CV filtering time for recruiters.
  * Created a modern responsive dashboard layout working on mobile and desktop viewports.
* **Future Scope**:
  * Integration of an automated ATS (Applicant Tracking System) parser to rank resumes.
  * Video conferencing integration directly within the portal for technical rounds.
  * Mock interview portal with AI feedback loops.
