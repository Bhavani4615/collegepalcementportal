# College Placement Portal - Setup Instructions

This document provides a step-by-step setup guide for running the College Placement Portal locally.

---

## 1. Prerequisites

Ensure you have the following software installed:
* **Java Development Kit (JDK) 17**
* **Apache Maven 3.8+**
* **MySQL Community Server 8.0+**
* **Node.js (v18+) & npm (v9+)**
* **Git** (for version control)

---

## 2. Database Setup (MySQL)

1. Open your MySQL client (Command Line, Workbench, or phpMyAdmin).
2. Start the MySQL server.
3. Import the database schema and sample seed data using the provided `schema.sql` file:
   * **Via MySQL CLI**:
     ```bash
     mysql -u root -p < schema.sql
     ```
   * **Via Workbench**: Open `schema.sql` and run all queries.
4. This script creates the database `placement_db` and inserts sample student, recruiter, admin credentials, job postings, and applications.
5. *Note*: The default password for all seeded users is **`password123`**.

---

## 3. Backend Setup (Spring Boot)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Open `src/main/resources/application.properties` and verify/adjust your MySQL username and password:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
3. Run maven to resolve dependencies and build the jar file:
   ```bash
   mvn clean install
   ```
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
5. The backend server will start on port `8080` (e.g. `http://localhost:8080`). 
6. An upload folder `./uploads/resumes/` will be created automatically in the root of the backend folder to store PDF resume uploads.

---

## 4. Frontend Setup (React + Vite)

1. Open a new terminal in the project root directory (which contains `package.json`).
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. The React application will run locally on `http://localhost:5173`.
5. Open your browser and navigate to `http://localhost:5173`.

---

## 5. Seed Users Credentials for Testing

Use the following accounts to sign in and test the system:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin (TPO)** | `tpo@university.edu` | `password123` | Can verify company job postings and view system analytics |
| **Recruiter** | `recruiter@microsoft.com` | `password123` | Can post jobs, view applicant list, and schedule interviews |
| **Recruiter** | `recruiter@google.com` | `password123` | Can post jobs, view applicant list, and schedule interviews |
| **Student (High CGPA)** | `student1@university.edu` | `password123` | CGPA: `8.75`. Meets eligibility for Google / Microsoft |
| **Student (Low CGPA)** | `student2@university.edu` | `password123` | CGPA: `7.20`. Ineligible for drives requiring CGPA > 7.20 |

---

## 6. Project Architecture Diagram

```
+------------------+           HTTP REST API (JWT)           +---------------------+
|  React Frontend  | <=====================================> | Spring Boot Backend |
| (Vite, Axios,    |                                         |  (Spring Security,  |
|  CSS Variables)  |                                         |   JPA, JWT)         |
+------------------+                                         +---------------------+
                                                                        ||
                                                                        || (Hibernate / JDBC)
                                                                        \/
                                                             +---------------------+
                                                             |  MySQL Database     |
                                                             |   (placement_db)    |
                                                             +---------------------+
```

---

## 7. Interactive API Documentation (Swagger UI)

You can explore, inspect, and execute all the REST API endpoints directly from your browser:
1. Ensure the Spring Boot backend is running.
2. Open your browser and navigate to:
   ```
   http://localhost:8080/swagger-ui/index.html
   ```
3. Use the login credentials in **Section 5** to authenticate and get a JWT token. You can copy the token value and paste it into the **Authorize** lock button in Swagger to make requests to secured endpoints!

