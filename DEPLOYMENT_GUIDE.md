# Production Deployment Guide
## College Placement Portal

This document outlines how to deploy the College Placement Portal in a production environment (such as AWS, DigitalOcean, or Azure).

---

## 1. Database Deployment (MySQL)

You can host the database on a managed DB service (like **AWS RDS MySQL**) or install it on a Virtual Machine (VM).

### Steps for Ubuntu VM installation:
1. Update repositories and install MySQL Server:
   ```bash
   sudo apt update
   sudo apt install mysql-server -y
   ```
2. Secure the installation:
   ```bash
   sudo mysql_secure_installation
   ```
3. Open MySQL shell and create the database and user:
   ```sql
   CREATE DATABASE placement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'placement_user'@'%' IDENTIFIED BY 'ProdPasswordSecure2026!';
   GRANT ALL PRIVILEGES ON placement_db.* TO 'placement_user'@'%';
   FLUSH PRIVILEGES;
   ```
4. Run the DDL statements from the `schema.sql` file against this database to initialize the structure.

---

## 2. Backend Deployment (Spring Boot)

We package the Spring Boot backend into an executable fat JAR and run it as a system service.

### 2.1 Packaging the Application
From your local development machine or CI/CD runner:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the production JAR file:
   ```bash
   mvn clean package -DskipTests
   ```
3. A jar file named `portal-0.0.1-SNAPSHOT.jar` will be created inside the `target/` directory. Copy this file to your production Linux server.

### 2.2 Configure Production Properties
Create an external properties file on your production server (e.g., `/opt/placement/application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/placement_db?useSSL=true&serverTimezone=UTC
spring.datasource.username=placement_user
spring.datasource.password=ProdPasswordSecure2026!

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
server.port=8080

# Production upload directory
file.upload-dir=/var/www/placement/uploads/resumes

# Production JWT Secret (Replace with a cryptographically strong 256-bit key)
placement.app.jwtSecret=ProdSecureSecretKeyMustBeVeryLongToSatisfyHS256AlgorithmSigningRequirements2026!!
placement.app.jwtExpirationMs=86400000
```

### 2.3 Running as a Systemd Service
Create a systemd service file `/etc/systemd/system/placement-backend.service`:
```ini
[Unit]
Description=Placement Portal Spring Boot Backend
After=syslog.target network.target

[Service]
User=www-data
ExecStart=/usr/bin/java -jar /opt/placement/portal-0.0.1-SNAPSHOT.jar --spring.config.location=/opt/placement/application.properties
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```
Start and enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start placement-backend
sudo systemctl enable placement-backend
```

---

## 3. Frontend Deployment (React + Vite)

### 3.1 Static Hosting (Vercel / Netlify / Cloudflare Pages)
This is the easiest and most performant way to host the React SPA.
1. Build the production assets locally or in the build setting:
   ```bash
   npm run build
   ```
2. This creates a `dist/` directory.
3. Configure the host build settings:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Routing Fallback**: Configure URL rewriting to redirect all paths (`/*`) to `/index.html` to allow React Router to work correctly on subpages.

### 3.2 Hosting via Nginx (VPS VM)
To host the frontend on the same VM as the backend:
1. Install Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. Copy the contents of the built `dist/` folder to `/var/www/placement/frontend`.
3. Create Nginx server configuration `/etc/nginx/sites-available/placement`:
   ```nginx
   server {
       listen 80;
       server_name collegeplacement.youruniversity.edu;

       # Frontend location
       location / {
           root /var/www/placement/frontend;
           try_files $uri $uri/ /index.html;
       }

       # Reverse Proxy for Spring Boot Backend API
       location /api/ {
           proxy_pass http://localhost:8080/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Enable the configuration and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/placement /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```
5. Install SSL Certificate using **Certbot** for HTTPS:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d collegeplacement.youruniversity.edu
   ```
