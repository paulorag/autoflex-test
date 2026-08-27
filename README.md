# 🏭 Autoflex PCP — Production Planning & Control System

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-Database_Migrations-CC0200.svg?logo=flyway&logoColor=white)](https://flywaydb.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF.svg?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D.svg?logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)

> 🇧🇷 **Looking for the Portuguese version?** Check out [README-pt.md](README-pt.md).

---

## 🚀 Live Demo & Documentation

- **Frontend Application:** [https://autoflex-pcp.vercel.app/](https://autoflex-pcp.vercel.app/)
- **Backend REST API:** [https://autoflex-api-hdo2.onrender.com](https://autoflex-api-hdo2.onrender.com)
- **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3 JSON Spec:** `http://localhost:8080/api-docs`

> *Note: Free cloud hosting (Render) may take up to 50 seconds to spin up on cold start.*

---

## 📋 About the System

**Autoflex PCP** is a modern Full-Stack **Production Planning and Control (PCP / MRP)** solution designed for manufacturing and assembly operations. The system manages **Raw Materials**, **Product Bill of Materials (BOM)**, and employs an intelligent **Greedy Optimization Algorithm** to determine the optimal production mix that maximizes total sales revenue based on physical stock constraints.

Additionally, Autoflex provides **Atomic Stock Deductions** upon production execution and full **Historical Traceability** for all manufactured batches.

---

## 🏗️ Architecture & Tech Stack

```
autoflex-pcp/
├── .github/workflows/ci.yml       # GitHub Actions CI Pipeline (Java 21 + Node 20)
├── backend/                       # Spring Boot 3.4.3 REST API (Clean Layered Architecture)
│   ├── src/main/java/com/autoflex/production/
│   │   ├── config/                # CORS, Swagger/OpenAPI, Security configs
│   │   ├── controller/            # REST Controllers (@Valid, Semantic HTTP codes)
│   │   ├── domain/                # JPA Entities (Optimized Lombok, Lazy Loading)
│   │   ├── dto/                   # Immutable Request/Response Records
│   │   ├── exception/             # Global Exception Handler (@RestControllerAdvice)
│   │   ├── mapper/                # Component Mappers (Entity <-> DTO)
│   │   ├── repository/            # Spring Data JPA Repositories (@EntityGraph)
│   │   └── service/               # Business Logic (@Transactional, Optimization)
│   └── src/main/resources/
│       ├── db/migration/          # Flyway Database Migrations (V1 to V4)
│       └── application.properties # H2 fallback & PostgreSQL configuration
├── frontend/                      # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/            # Sidebar, Header, Modals, ConfirmDialogs
│   │   ├── pages/                 # Dashboard, Raw Materials, Products, Planning, Orders
│   │   ├── services/              # Modular Axios HTTP Client Services
│   │   └── types/                 # TypeScript Interfaces (DTO-aligned)
│   └── cypress/                   # End-to-End (E2E) Test Suites
└── docker-compose.yaml            # Full Stack Multi-Container Orchestration
```

### 🛠️ Key Technologies:
- **Backend:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Jakarta Bean Validation, Flyway Migrations, SpringDoc OpenAPI 3, Spring Boot Actuator, H2 (test/dev) & PostgreSQL 16 (production).
- **Frontend:** React 19, TypeScript 5.9, Vite, Bootstrap 5, Lucide Icons, Axios.
- **DevOps & QA:** Docker & Docker Compose, Nginx Alpine, GitHub Actions CI, JUnit 5, Mockito, MockMvc, Cypress E2E.

---

## ✨ Core Features

1. **📊 Industrial PCP Dashboard:**
   - Real-time KPI summary (Projected Sales Revenue, Stock Health, Catalog Items, Completed Orders).
   - Quick production planning overview with one-click production execution.
   - Visual stock availability progress bars with low-stock alerts.

2. **📦 Raw Material Inventory Management:**
   - Full CRUD operations with instant search filter.
   - Real-time stock volume indicators and depletion alerts.
   - Referential integrity safeguards to prevent deleting materials used in active recipes.

3. **🛠️ Product Catalog & Bill of Materials (BOM):**
   - Products with dynamic multi-ingredient recipes ($N:N$ relationships).
   - Duplicate ingredient prevention and real-time validation.
   - Ticket price analytics and composition chips.

4. **⚡ Smart Production Planning Algorithm:**
   - Analyzes available inventory and sorts products by highest sales value.
   - Greedily allocates available raw materials to maximize factory financial revenue.
   - Protected against division-by-zero, invalid recipes, and zero-stock scenarios.

5. **⚡ Atomic Production Order Execution:**
   - Executes the planned production run with transactional integrity (`@Transactional`).
   - Automatically deducts physical raw material quantities from inventory.
   - Generates persistent **Production Orders** with complete batch details.

6. **📜 Production Orders History & Traceability:**
   - Chronological audit trail of all executed manufacturing runs.
   - Expandable timeline accordion detailing manufactured quantities, unit prices, and subtotals.

---

## 🚀 Quick Start with Docker (Recommended)

Run the entire stack (Database + Backend + Frontend) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/paulorag/autoflex-pcp.git
cd autoflex-pcp

# 2. Build and start all containers
docker compose up --build
```

Access the services:
- 🌐 **Frontend Web UI:** [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend REST API:** [http://localhost:8080/api](http://localhost:8080/api)
- 📖 **Swagger UI Docs:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- 🏥 **Health Check:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 💻 Manual Local Development Setup

### Prerequisites
- **Java JDK 21** or higher
- **Node.js 20+** and npm
- **Maven** (optional, `./mvnw` wrapper included)

### 1. Run Backend
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```
*The backend starts on `http://localhost:8080` with in-memory H2 database and Flyway migrations applied automatically.*

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend starts on `http://localhost:5173`.*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/raw-materials` | List all raw materials in stock | `200 OK` |
| `POST` | `/api/raw-materials` | Create a new raw material | `201 Created` |
| `GET` | `/api/raw-materials/{id}` | Get raw material by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/raw-materials/{id}` | Update raw material | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/raw-materials/{id}` | Delete raw material (if unused) | `204 No Content` / `409 Conflict` |
| `GET` | `/api/products` | List all products and recipes | `200 OK` |
| `POST` | `/api/products` | Create a product with recipe (BOM) | `201 Created` |
| `GET` | `/api/products/{id}` | Get product details by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/products/{id}` | Update product and recipe | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Delete product from catalog | `204 No Content` / `404 Not Found` |
| `GET` | `/api/production-planning` | Calculate optimized production plan | `200 OK` |
| `POST` | `/api/production-planning/execute` | Execute production plan & deduct stock | `201 Created` / `400 Bad Request` |
| `GET` | `/api/production-orders` | List production orders history | `200 OK` |
| `GET` | `/api/production-orders/{id}` | Get production order by ID | `200 OK` / `404 Not Found` |

---

## 🧪 Testing Suite

### Backend Unit & Integration Tests (JUnit 5 + Mockito + MockMvc)
```bash
cd backend
./mvnw clean test
```
*Executes all 37 unit and integration test scenarios covering services, controllers, validations, and real database constraints.*

### Frontend Production Build Check
```bash
cd frontend
npm run build
```

### End-to-End Tests (Cypress)
```bash
cd frontend
npx cypress open   # Interactive GUI
# or
npx cypress run    # Headless mode
```

---

## 👨‍💻 Author

Developed with ❤️ by **Paulo Roberto** ([GitHub](https://github.com/paulorag) • [Email](mailto:devpaulorag@gmail.com)).
