# Project Viva Questions & Answers

This document lists frequently asked questions (with detailed answers) by external examiners during final-year project evaluations and placement interviews.

---

### Q1: Why did you choose React for the frontend and Spring Boot for the backend instead of a monolithic architecture (like Thymeleaf or JSP)?
**Answer:** We chose a decoupled Client-Server architecture to mimic production-grade enterprise software.
* **Separation of Concerns**: React manages the presentation layer (Virtual DOM, UI components, states), while Spring Boot handles the business logic, transaction boundaries, security, and persistence.
* **Performance**: With React, only the bundle is loaded on the initial page load. Subsequent transitions are rendered client-side using JavaScript, and data is fetched asynchronously via lightweight JSON payloads, reducing server load.
* **API Reusability**: The Spring Boot REST APIs can also power mobile applications (Android/iOS) in the future without modifying backend code.

---

### Q2: How does JWT Authentication work in your application?
**Answer:** We use stateless authentication with JSON Web Tokens:
1. The user logs in by submitting credentials to `/api/auth/login`.
2. The server validates the credentials against the MySQL database. If valid, it generates a JWT containing the user's email as the subject, an issue date, and an expiration timestamp, signed using a secure secret key via HMAC-SHA256.
3. The server sends the JWT back in the HTTP response body.
4. React receives the token and stores it in `localStorage` as part of the user session.
5. For all subsequent API requests, React uses an Axios request interceptor to attach the token in the headers as: `Authorization: Bearer <JWT_TOKEN>`.
6. On the server, `AuthTokenFilter` intercepts every request, extracts the JWT, verifies its signature and expiration, extracts the username (email), loads user details, and sets the Spring Security Context.

---

### Q3: What is the difference between encryption and hashing? How is password security implemented in your portal?
**Answer:** 
* **Hashing** is a one-way mathematical function. Once data is hashed, it cannot be decrypted back to its plain text format. We use it for passwords because we never need to know the actual password; we only need to verify if the entered password matches the hash.
* **Encryption** is a two-way function where plain text is transformed into ciphertext using an encryption key, and it can be decrypted back to plain text using a decryption key.
* **Security Implementation**: In our portal, we use **BCryptPasswordEncoder** to hash passwords before saving them. BCrypt incorporates a random **salt** for every hash, which prevents rainbow table attacks. Even if two users have the same password "password123", their stored BCrypt hashes will look completely different.

---

### Q4: Explain the database design. Is your database normalized?
**Answer:** Yes, our MySQL database is highly normalized (up to **Third Normal Form - 3NF**):
* **1NF**: Every column contains atomic values, and every record is unique.
* **2NF**: It is in 1NF and contains no partial dependencies. All non-prime attributes are fully dependent on the primary key. For example, profile details are split into `student_profiles` and `company_profiles` instead of packing everything in a single bloated `users` table.
* **3NF**: It is in 2NF and has no transitive dependencies. For example, in the `jobs` table, the recruiter details are referenced by `recruiter_id` (foreign key) pointing to the `users` table, rather than repeating recruiter names or contact lines directly in the job record.

---

### Q5: What is JPA/Hibernate, and what is the benefit of the `@MapsId` annotation in your profile entities?
**Answer:**
* **JPA (Java Persistence API)** is a specification that defines object-relational mapping (ORM) in Java. **Hibernate** is the ORM provider implementing JPA.
* **`@MapsId` Benefit**: In our `StudentProfile` and `CompanyProfile` entities, we want a strict One-to-One relationship where the profile shares the exact same primary key value as the corresponding `User` record. Using `@MapsId` tells Hibernate to copy the primary key of the parent `User` entity and use it as both the primary key and the foreign key for the child profile. This eliminates the overhead of managing separate ID sequences and speeds up database join lookups.

---

### Q6: What is CORS, and how did you resolve it in this project?
**Answer:** 
* **CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that restricts a web application running at one origin (e.g. React at `http://localhost:5173`) from making requests to a server at a different origin (e.g. Spring Boot at `http://localhost:8080`).
* **Resolution**: In Spring Security configuration, we configured a `CorsConfigurationSource` bean that explicitly allows incoming traffic from `http://localhost:5173`, permits standard HTTP methods (GET, POST, PUT, DELETE, OPTIONS), exposes the `Authorization` header, and allows credentials.

---

### Q7: What are React hooks, and which ones did you use?
**Answer:** React hooks are functions that let functional components manage state and lifecycle features. We used:
* **`useState`**: To manage component states (e.g., jobs lists, profile input fields, active tab indicators, loading spinners).
* **`useEffect`**: To trigger side-effects, such as fetching job postings or notification logs from the backend on component mount or tab switches.
* **`useCallback`**: To memoize function definitions. For example, we wrapped data-fetching functions in `useCallback` to prevent infinite re-render loops when they are passed as dependencies to `useEffect`.

---

### Q8: How does your portal handle secure file uploads (Resumes)?
**Answer:** 
1. The student selects a PDF file in the profile tab.
2. The React frontend reads the file and posts it as a `MultipartFile` inside a `FormData` object with headers set to `Content-Type: multipart/form-data` to `/api/resumes/upload`.
3. In the Spring Boot controller, the file is validated to ensure it is not empty and that the mime-type is strictly `application/pdf` to prevent malicious shell script executions (e.g. .jsp, .exe, .sh uploads).
4. The `FileStorageService` cleanses the filename, renames it to a standardized convention `resume_{userId}.pdf` to prevent directory traversal attacks, and copies it to a local workspace folder `./uploads/resumes/`.
5. The backend generates a download URL (`/api/resumes/download/resume_{userId}.pdf`) and saves it to the student's database record.
6. Recruiters can download the file directly via an authenticated stream response.
