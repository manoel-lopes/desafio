# Desafio — API NestJS + Frontend Angular

Monorepo com **backend REST** (NestJS 11, Fastify, Prisma, PostgreSQL, Redis) e **frontend** (Angular 21 com SSR). A forma recomendada de rodar é via **Docker Compose na raiz do repositório**.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 com o plugin **Compose** (`docker compose`)
- Git

## 1. Clonar o repositório

```bash
git clone https://github.com/manoel-lopes/desafio.git desafio
cd desafio
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Os valores padrão já apontam `DB_HOST` e `REDIS_HOST` para os serviços internos do Compose (`postgres` e `redis`). Edite `.env` apenas se quiser mudar senhas, nome do banco ou portas expostas.

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3333` | Porta da API no host |
| `FRONT_PORT` | `4000` | Porta do frontend no host |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `postgres` / `postgres` / `template_api` | Credenciais do PostgreSQL |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/template_api?schema=public` | URL de conexão Prisma |
| `REDIS_HOST` / `REDIS_PORT` | `redis` / `6379` | Conexão Redis |

## 3. Subir a aplicação

```bash
docker compose up -d --build
```

O Compose sobe quatro serviços em ordem:

| Serviço | Imagem / Build | Descrição |
|---------|---------------|-----------|
| `postgres` | `postgres:16-alpine` | Banco de dados |
| `redis` | `redis:7-alpine` | Cache |
| `api` | `./back/Dockerfile` | API NestJS — executa migrações Prisma e inicia o servidor |
| `front` | `./front/Dockerfile` | Angular SSR + proxy `/api` → API |

O serviço `api` aguarda o postgres e o redis passarem nos healthchecks antes de iniciar. O `front` aguarda a `api` estar saudável (endpoint `/vehicles` respondendo 200) antes de subir.

## 4. Acessar a aplicação

| URL | Descrição |
|-----|-----------|
| `http://localhost:4000` | Interface Angular (SSR) |
| `http://localhost:3333/vehicles` | API REST direta |
| `http://localhost:3333/docs` | Swagger (apenas em `NODE_ENV=development`) |

O browser comunica com o frontend em `/api/...`; o container `front` encaminha internamente para `http://api:3333`.

## 5. Verificar que está funcionando

```bash
# Status dos containers e healthchecks
docker compose ps

# Listar veículos via API direta
curl -sS "http://localhost:3333/vehicles?page=1&pageSize=5"

# Listar veículos via proxy do frontend
curl -sS "http://localhost:4000/api/vehicles?page=1&pageSize=5"

# Acompanhar logs
docker compose logs -f api
docker compose logs -f front
```

## 6. Parar e limpar

```bash
# Parar containers (dados preservados)
docker compose down

# Parar e remover volumes (apaga dados do Postgres e Redis)
docker compose down -v
```

## Estrutura do repositório

```
desafio/
├── back/                  # API NestJS + Prisma
│   ├── Dockerfile
│   ├── src/
│   └── prisma/
├── front/                 # Angular 21 SSR
│   ├── Dockerfile
│   └── src/
├── docker-compose.yml     # Stack completa
├── .env.example           # Template de variáveis
└── README.md
```

Para desenvolvimento local sem Docker, consulte [`back/README.md`](back/README.md) e [`front/README.md`](front/README.md).
