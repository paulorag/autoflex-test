# 🏭 Production Planning System (Autoflex Challenge)

[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue)](https://www.docker.com/)

> 🇧🇷 **Português:** Role para baixo para ver a versão em português.

---

## 🚀 Live Demo (Production)

- **Frontend (Application):** https://autoflex-test.vercel.app/
- **Backend (API):** https://autoflex-api-hdo2.onrender.com

_Note: The backend is hosted on a free tier service (Render). The first request may take up to 50 seconds to wake up the server._

---

## 🇺🇸 About the Project

This Full Stack solution was developed to manage a production line, handling **Raw Materials**, **Products** (with dynamic recipes/bills of materials), and **Production Planning**.

The system automates the calculation of production capacity based on current stock levels and prioritizes products with higher sales value, adhering to **Clean Architecture** and **SOLID** principles.

### 🛠️ Tech Stack

- **Backend:** Java 21, Spring Boot 3, JPA/Hibernate, PostgreSQL (Neon Serverless), JUnit 5.
- **Frontend:** React (Vite), TypeScript, Bootstrap 5, Axios.
- **Quality Assurance:**
    - **JUnit & Mockito:** Unit testing for Business Logic (Production Service).
    - **Cypress:** End-to-End (E2E) testing for critical user flows.
- **DevOps & Cloud:** Docker, Docker Compose, Vercel (Front) & Render (Back).

### ✨ Key Features

1.  **Raw Material Management:** Full CRUD with stock control.
2.  **Product Management:**
    - Create products with **dynamic recipes** (N:N relationships).
    - Add/Remove ingredients directly within the product modal.
3.  **Production Planning Algorithm:**
    - Automatically calculates how many units can be produced with available stock.
    - **Smart Prioritization:** Prioritizes products with higher sales value (Business Rule).
4.  **UX/UI:** Modern interface with feedback toasts, modals, and responsive design.

### 📦 How to Run Locally

#### Option 1: Via Docker (Recommended) 🐳

1.  Clone the repository:
    ```bash
    git clone [https://github.com/paulorag/autoflex-test.git](https://github.com/paulorag/autoflex-test.git)
    cd autoflex-test
    ```
2.  Start the containers:
    ```bash
    docker-compose up --build
    ```
3.  Access the application:
    - **Frontend:** http://localhost:5173
    - **Backend API:** http://localhost:8080/api

#### Option 2: Manual Setup

- **Backend:** Run `./mvnw spring-boot:run` inside the `backend` folder.
- **Frontend:** Run `npm install && npm run dev` inside the `frontend` folder.

### ✅ Testing

- **Unit Tests (Backend):** Run `./mvnw test` in `backend/`.
- **E2E Tests (Cypress):** Run `npx cypress open` in `frontend/`.

---

---

## 🇧🇷 Sobre o Projeto (Versão em Português)

### 🚀 Demonstração (Ao Vivo)

- **Frontend (Aplicação):** https://autoflex-test.vercel.app/
- **Backend (API):** https://autoflex-api-hdo2.onrender.com

_Nota: O backend está hospedado em um serviço gratuito (Render). A primeira requisição pode levar até 50 segundos para "acordar" o servidor._

---

Esta solução Full Stack foi desenvolvida para o gerenciamento de linha de produção, permitindo o cadastro de **Matérias-Primas**, **Produtos** (com receitas dinâmicas) e **Planejamento de Produção**.

O sistema automatiza o cálculo da capacidade produtiva baseada no estoque atual e prioriza produtos com maior valor de venda, seguindo princípios de **Clean Architecture** e **SOLID**.

### 🛠️ Tecnologias Utilizadas

- **Backend:** Java 21, Spring Boot 3, JPA/Hibernate, PostgreSQL (Neon Serverless), JUnit 5.
- **Frontend:** React (Vite), TypeScript, Bootstrap 5, Axios.
- **Qualidade (QA):**
    - **JUnit & Mockito:** Testes unitários para Regra de Negócio (Service).
    - **Cypress:** Testes Ponta-a-Ponta (E2E) para fluxos críticos.
- **DevOps & Cloud:** Docker, Docker Compose, Vercel (Front) e Render (Back).

### ✨ Funcionalidades Principais

1.  **Gestão de Matérias-Primas:** CRUD completo com controle de estoque.
2.  **Gestão de Produtos:**
    - Criação de produtos com **receitas dinâmicas** (Relacionamento N:N).
    - Adição/Remoção de ingredientes na mesma interface.
3.  **Algoritmo de Planejamento:**
    - Cálculo automático de quantos produtos podem ser fabricados.
    - **Priorização Inteligente:** O sistema prioriza a fabricação de produtos com maior valor de venda.
4.  **UX/UI:** Interface moderna com feedbacks visuais e design responsivo.

### 📦 Como Rodar Localmente

#### Opção 1: Via Docker (Recomendado) 🐳

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/paulorag/autoflex-test.git](https://github.com/paulorag/autoflex-test.git)
    cd autoflex-test
    ```
2.  Suba os containers:
    ```bash
    docker-compose up --build
    ```
3.  Acesse a aplicação:
    - **Frontend:** http://localhost:5173
    - **Backend API:** http://localhost:8080/api

#### Opção 2: Execução Manual

- **Backend:** Execute `./mvnw spring-boot:run` dentro da pasta `backend`.
- **Frontend:** Execute `npm install && npm run dev` dentro da pasta `frontend`.

### ✅ Testes Automatizados

- **Testes Unitários (Backend):** Execute `./mvnw test` na pasta `backend/`.
- **Testes E2E (Cypress):** Execute `npx cypress open` na pasta `frontend/`.

---

**Author/Autor:** Paulo Roberto
