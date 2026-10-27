# Firecrawl Self-Hosted - Guia de Instalação

## Visão Geral

Firecrawl é uma plataforma de web scraping optimizada para IA. Existem 2 caminhos:

1. **Serviço hospedado** (recomendado para começar): `firecrawl.dev`
2. **Self-hosted** (código aberto AGPL-3.0): docker-compose local/infraestrutura própria

Este guia cobre a **instalação self-hosted**.

---

## Requisitos do Sistema

### Mínimos
- **Docker** e **Docker Compose** (v1.29+)
- **Node.js 22+** (apenas se modificar código)
- **RAM**: 8GB recomendado (mínimo 4GB)
- **CPU**: 4 cores recomendado
- **Disco**: 20GB livre

### Dependências de Serviço
Firecrawl precisa de:
- **PostgreSQL** (queue/metadados)
- **Redis** (rate limiting, cache)
- **RabbitMQ** (fila de jobs)
- **Playwright Service** (automação browser)

O `docker-compose.yaml` já inclui todas estas. ✅

---

## Instalação Passo-a-Passo

### 1. Clone repositório

```bash
git clone https://github.com/firecrawl/firecrawl.git
cd firecrawl
```

### 2. Configure variáveis de ambiente

Crie `.env` na raiz:

```bash
# Postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=firecrawl
POSTGRES_HOST=nuq-postgres
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://redis:6379

# Playwright
PLAYWRIGHT_MICROSERVICE_URL=http://playwright-service:3000/scrape

# API Config
NUM_WORKERS_PER_QUEUE=8
BROWSER_POOL_SIZE=5
MAX_CONCURRENT_JOBS=5
CRAWL_CONCURRENT_REQUESTS=10

# Logging
LOGGING_LEVEL=info

# Opcional: IA features (OpenAI ou Ollama)
# OPENAI_API_KEY=sk-...
# OLLAMA_BASE_URL=http://ollama:11434
```

### 3. Construir (opcional, ou use imagem pré-built)

Para **usar imagens pré-compiladas** (mais rápido):

```bash
# Descomentar `image:` e comentar `build:` em docker-compose.yaml
```

Para **compilar localmente** (padrão):

```bash
docker-compose build
```

### 4. Iniciar serviços

```bash
docker-compose up -d
```

**O que inicia:**
- API (porta 3000)
- PostgreSQL (5432)
- Redis (6379)
- RabbitMQ (15672 / 5672)
- Playwright Service (3000, interno)

### 5. Verificar saúde

```bash
# API pronta
curl http://localhost:3000/health

# Logs da API
docker-compose logs -f api

# Verificar todos serviços
docker-compose ps
```

Esperado:
```
STATUS: Up
api running
redis running
nuq-postgres running
playwright-service running
```

### 6. Autenticação

Firecrawl self-hosted requer `BULL_AUTH_KEY` para proteger fila:

```bash
# Gerar chave aleatória
openssl rand -hex 32
```

Adicione ao `.env`:
```
BULL_AUTH_KEY=<chave-gerada>
```

Restart:
```bash
docker-compose restart api
```

---

## Uso

### Via SDK (Node.js)

```bash
npm install firecrawl
```

```javascript
import { Firecrawl } from 'firecrawl';

const app = new Firecrawl({
  apiUrl: 'http://localhost:3000', // self-hosted
  apiKey: 'seu-api-key' // ou BULL_AUTH_KEY se configurado
});

// Scrape
const result = await app.scrapeUrl('https://example.com');
console.log(result.markdown);

// Search
const search = await app.search('node.js web scraping', { limit: 5 });
console.log(search);
```

### Via SDK (Python)

```bash
pip install firecrawl-py
```

```python
from firecrawl import Firecrawl

app = Firecrawl(
    api_url='http://localhost:3000',
    api_key='seu-api-key'
)

result = app.scrape('https://example.com')
print(result.markdown)
```

### Via cURL

```bash
curl -X POST 'http://localhost:3000/v2/scrape' \
  -H 'Authorization: Bearer seu-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown", "html"]
  }'
```

---

## Troubleshooting

### API não responde em localhost:3000

```bash
# Verificar logs
docker-compose logs api

# Reiniciar
docker-compose restart api

# Verificar conexão DB
docker-compose logs nuq-postgres
```

### Playwright Service falha (browser pool)

```bash
# Aumentar RAM limit em docker-compose.yaml
memswap_limit: 8G  # de 4G
```

### Erro: "No authorization for this queue"

- Defina `BULL_AUTH_KEY` no `.env`
- Passe `Authorization: Bearer {BULL_AUTH_KEY}` em requests

### Container desliga após iniciar

```bash
# Verificar logs detalhados
docker-compose logs api --tail 50
```

---

## Operação

### Parar tudo

```bash
docker-compose down
```

### Ver logs em tempo real

```bash
docker-compose logs -f api
```

### Limpar dados (reset banco)

```bash
docker-compose down -v  # remove volumes
docker-compose up -d
```

---

## Configuração Avançada

### Usar imagens pré-compiladas (ghcr.io)

Em `docker-compose.yaml`, para cada serviço:

```yaml
# Comentar:
# build: apps/api

# Descomentar:
image: ghcr.io/firecrawl/firecrawl:latest
image: ghcr.io/firecrawl/playwright-service:latest
```

### Integrar com seu projeto

```bash
# SDKs suportados
# Node.js, Python, Go, Java, Rust, Ruby, PHP, .NET

npm install firecrawl
pip install firecrawl-py
```

### Funcionalidades principais

| Feature | Endpoint | Exemplo |
|---------|----------|---------|
| **Scrape** | POST /v2/scrape | Extrair markdown/JSON de URL |
| **Search** | POST /v2/search | Buscar web + retornar conteúdo |
| **Crawl** | POST /v2/crawl | Raspar site inteiro |
| **Interact** | POST /v2/interact | Click, type, wait antes de scrape |
| **Parse** | POST /v2/parse | PDFs, DOCX → markdown/JSON |

---

## Links úteis

- Docs oficiais: https://docs.firecrawl.dev
- Repo: https://github.com/firecrawl/firecrawl
- Discord: https://discord.gg/firecrawl
- Benchmarks: https://firecrawl.dev/blog (96% cobertura web)

---

## Próximos passos

1. ✅ Instalação concluída
2. Testar scrape em localhost:3000
3. Integrar SDK ao seu projeto (myfirstcocktail)
4. Configurar webhooks se precisar notificações
