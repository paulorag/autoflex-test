# 🏭 Autoflex PCP — Sistema de Planejamento e Controle da Produção

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.3-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-Database_Migrations-CC0200.svg?logo=flyway&logoColor=white)](https://flywaydb.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose_Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF.svg?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D.svg?logo=swagger&logoColor=black)](http://localhost:8080/swagger-ui.html)

> 🇺🇸 **Looking for the English version?** Check out [README.md](README.md).

---

## 🚀 Demonstração ao Vivo & Documentação da API

- **Aplicação Frontend:** [https://autoflex-pcp.vercel.app/](https://autoflex-pcp.vercel.app/)
- **API REST Backend:** [https://autoflex-api-hdo2.onrender.com](https://autoflex-api-hdo2.onrender.com)
- **Documentação Interativa Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Especificação OpenAPI 3 JSON:** `http://localhost:8080/api-docs`

> *Nota: Por se tratar de hospedagem gratuita (Render), a primeira requisição pode levar até 50 segundos para despertar a instância (cold start).*

---

## 📋 Sobre o Sistema

O **Autoflex PCP** é uma solução Full-Stack moderna de **Planejamento e Controle da Produção (PCP / MRP)** voltada para indústrias e operações de montagem. O sistema gerencia o estoque de **Matérias-Primas**, **Fichas Técnicas de Produtos (BOM)** e utiliza um **Algoritmo Guloso de Otimização** para definir o melhor mix de fabricação que maximiza o faturamento financeiro com base nas limitações de insumos em estoque.

Além do cálculo da capacidade produtiva, o sistema permite a **Efetivação Atômica da Produção** (baixa real e imediata no estoque de insumos) e o registro do **Histórico com Rastreabilidade** de todas as ordens executadas.

---

## 🏗️ Arquitetura e Estrutura do Projeto

```
autoflex-pcp/
├── .github/workflows/ci.yml       # Pipeline de CI no GitHub Actions (Java 21 + Node 20)
├── backend/                       # API RESTful Spring Boot 3.4.3 (Clean Layered Architecture)
│   ├── src/main/java/com/autoflex/production/
│   │   ├── config/                # Configurações de CORS, Swagger/OpenAPI e Segurança
│   │   ├── controller/            # Controladores REST (@Valid, Códigos HTTP Semânticos)
│   │   ├── domain/                # Entidades JPA (Lombok limpo, FetchType.LAZY)
│   │   ├── dto/                   # Records imutáveis para Request e Response
│   │   ├── exception/             # Tratamento Global de Exceções (@RestControllerAdvice)
│   │   ├── mapper/                # Mappers Spring Component (Entidade <-> DTO)
│   │   ├── repository/            # Repositórios Spring Data JPA (@EntityGraph anti N+1)
│   │   └── service/               # Regras de Negócio (@Transactional, Otimização)
│   └── src/main/resources/
│       ├── db/migration/          # Migrações Versionadas com Flyway (V1 a V4)
│       └── application.properties # Configuração H2 memória & PostgreSQL
├── frontend/                      # SPA React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/            # Sidebar colapsável, Header, Modais, ConfirmDialogs
│   │   ├── pages/                 # Dashboard, Matérias-Primas, Produtos, Planejamento, Ordens
│   │   ├── services/              # Camada de Serviços HTTP isolada com Axios
│   │   └── types/                 # Interfaces TypeScript alinhadas aos DTOs
│   └── cypress/                   # Testes Automatizados Ponta a Ponta (E2E)
└── docker-compose.yaml            # Orquestração Multi-Container Full Stack
```

### 🛠️ Tecnologias Utilizadas:
- **Backend:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Jakarta Bean Validation, Flyway Migrations, SpringDoc OpenAPI 3, Spring Boot Actuator, H2 Database (desenvolvimento/testes) e PostgreSQL 16 (produção).
- **Frontend:** React 19, TypeScript 5.9, Vite, Bootstrap 5, Lucide Icons, Axios.
- **DevOps & QA:** Docker, Docker Compose, Nginx Alpine, GitHub Actions CI, JUnit 5, Mockito, MockMvc, Cypress E2E.

---

## ✨ Funcionalidades Principais

1. **📊 Painel Geral de PCP (Dashboard Industrial):**
   - Resumo em tempo real com KPIs (Faturamento Projetado, Saúde do Estoque, Itens Ativos, Ordens Realizadas).
   - Sugestão de fabricação imediata com botão de execução em 1 clique.
   - Indicador visual de saúde do estoque de matérias-primas com alertas de níveis críticos/esgotados.

2. **📦 Controle de Estoque de Matérias-Primas:**
   - CRUD completo com busca instantânea por nome.
   - Barras de progresso e badges coloridas de disponibilidade.
   - Proteção de integridade referencial impedindo exclusão de insumos vinculados a receitas ativas.

3. **🛠️ Catálogo de Produtos e Fichas Técnicas (BOM):**
   - Cadastro de produtos com receitas de múltiplos ingredientes (relacionamento $N:N$).
   - Prevenção em tempo real de matérias-primas duplicadas na mesma receita.
   - Indicadores de ticket médio e chips informativos de composição.

4. **⚡ Algoritmo Inteligente de Planejamento de Produção:**
   - Avalia o estoque disponível e ordena os produtos por maior preço de venda.
   - Aloca matérias-primas de forma gulosa priorizando a maximização do faturamento da fábrica.
   - Protegido contra divisão por zero, estoques negativos e produtos sem componentes.

5. **⚡ Efetivação Real de Produção & Baixa de Estoque:**
   - Execução transacional (`@Transactional`) da fabricação sugerida.
   - Débito automático das quantidades consumidas no estoque físico de matérias-primas.
   - Geração de **Ordem de Produção** persistente com histórico detalhado.

6. **📜 Rastreabilidade & Histórico de Ordens:**
   - Linha do tempo cronológica de todas as produções realizadas na fábrica.
   - Accordion expansível com detalhes de itens fabricados, valores unitários e subtotais.

---

## 🚀 Como Executar com Docker (Recomendado)

Suba todo o ecossistema (PostgreSQL + Backend + Frontend) com um único comando:

```bash
# 1. Clone o repositório
git clone https://github.com/paulorag/autoflex-pcp.git
cd autoflex-pcp

# 2. Construa e inicie os containers
docker compose up --build
```

Acesse os serviços locais:
- 🌐 **Aplicação Frontend:** [http://localhost:5173](http://localhost:5173)
- 🔌 **API REST Backend:** [http://localhost:8080/api](http://localhost:8080/api)
- 📖 **Documentação Swagger:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- 🏥 **Health Check:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 💻 Execução Manual em Ambiente de Desenvolvimento

### Pré-requisitos
- **Java JDK 21** ou superior
- **Node.js 20+** e npm
- **Maven** (opcional, wrapper `./mvnw` incluso)

### 1. Iniciar o Backend
```bash
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```
*O backend inicializa em `http://localhost:8080` com banco em memória H2 e migrações Flyway aplicadas automaticamente.*

### 2. Iniciar o Frontend
```bash
cd frontend
npm install
npm run dev
```
*O frontend inicializa em `http://localhost:5173`.*

---

## 📡 Tabela de Endpoints da API RESTful

| Método | Endpoint | Descrição | Status HTTP |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/raw-materials` | Lista todas as matérias-primas em estoque | `200 OK` |
| `POST` | `/api/raw-materials` | Cadastra nova matéria-prima | `201 Created` |
| `GET` | `/api/raw-materials/{id}` | Busca matéria-prima por ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/raw-materials/{id}` | Atualiza matéria-prima existente | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/raw-materials/{id}` | Exclui matéria-prima (se não vinculada) | `204 No Content` / `409 Conflict` |
| `GET` | `/api/products` | Lista catálogo de produtos e receitas | `200 OK` |
| `POST` | `/api/products` | Cadastra novo produto com receita (BOM) | `201 Created` |
| `GET` | `/api/products/{id}` | Busca produto e receita por ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/products/{id}` | Atualiza dados e receita do produto | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/products/{id}` | Exclui produto do catálogo | `204 No Content` / `404 Not Found` |
| `GET` | `/api/production-planning` | Calcula o planejamento otimizado | `200 OK` |
| `POST` | `/api/production-planning/execute` | Efetiva produção e debita estoque | `201 Created` / `400 Bad Request` |
| `GET` | `/api/production-orders` | Lista histórico de ordens de produção | `200 OK` |
| `GET` | `/api/production-orders/{id}` | Busca ordem de produção por ID | `200 OK` / `404 Not Found` |

---

## 🧪 Suíte de Testes Automatizados

### Testes Unitários e de Integração no Backend (JUnit 5 + Mockito + MockMvc)
```bash
cd backend
./mvnw clean test
```
*Executa todos os 37 testes automatizados cobrindo regras de negócio, cálculo de planejamento, persistência de ordens e validações de banco de dados.*

### Validação de Build do Frontend (Type-Check & Vite)
```bash
cd frontend
npm run build
```

### Testes Ponta a Ponta E2E (Cypress)
```bash
cd frontend
npx cypress open   # Modo Interativo
# ou
npx cypress run    # Modo Headless
```

---

## 👨‍💻 Autor

Desenvolvido por **Paulo Roberto** ([GitHub](https://github.com/paulorag) • [Email](mailto:devpaulorag@gmail.com)).
