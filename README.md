# AuctionBazaar

The AuctionBazaar workspace contains a Spring Boot API and a React frontend.

## Project layout

- `backend/` - Java 17, Spring Boot, and JPA application
- `frontend/` - React application (retains its own Git repository and history)

The frontend remains independently versioned; make frontend Git commits from `frontend/` and backend changes from the workspace root.

## Requirements

- JDK 17
- MySQL
- Node.js and npm

## Configure and run the backend

Create the database once in MySQL:

```sql
CREATE DATABASE auction_db;
```

In PowerShell, set the connection values before starting the API:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/auction_db"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

Hibernate updates the tables when the application starts; it does not create the MySQL database itself. Email notifications require `MAIL_USERNAME` and `MAIL_PASSWORD` to be set in the same shell.

## Configure and run the frontend

In a second terminal, from the repository root:

```powershell
Set-Location .\frontend
npm ci
npm start
```

The React development server runs at `http://localhost:3000` and calls the API at `http://localhost:8080`.

## Checks

Run backend tests from `backend/` with `.\mvnw.cmd test`. Build the frontend from `frontend/` with `npm run build`.

