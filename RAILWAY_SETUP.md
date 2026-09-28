# Railway Setup - Manual Steps

## Task 4: Setup Railway Database (MySQL)

Após criar conta no Railway e fazer deploy do backend, execute estes passos:

### Step 1: Adicionar MySQL Service

1. Acesse https://railway.app
2. Vá para seu projeto `mycocktail`
3. Clique em **"New"** → **"Database"** → **"MySQL"**
4. Railway provisiona automaticamente
5. Aguarde 1-2 minutos

### Step 2: Copiar Connection String

1. No painel do Railway, clique em **MySQL** service
2. Vá para **"Connect"** tab
3. Você verá `DATABASE_URL=mysql://...` ou variáveis separadas:
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLPORT`
   - `MYSQLDATABASE`

### Step 3: Adicionar Variáveis ao Backend

1. Volte pro **Web** service (seu backend Express)
2. Vá para **"Variables"** tab
3. Adicione estas variáveis do MySQL:

```
DATABASE_HOST=<MYSQLHOST>
DATABASE_USER=<MYSQLUSER>
DATABASE_PASSWORD=<MYSQLPASSWORD>
DATABASE_NAME=<MYSQLDATABASE>
GEMINI_API_KEY=<sua_chave_gemini>
NODE_ENV=production
PORT=3000
```

4. Salve. Railway redeploya automaticamente.

### Step 4: Testar Conexão

1. Acesse seu backend no domínio Railway (ex: `https://myapp-prod.railway.app`)
2. Abra `/api/health` no navegador
3. Esperado: `{"status":"ok","timestamp":"..."}`

Se der erro 500: verificar logs do Railway (Railway → Web → Logs)

---

## Task 5: Migração de Dados (Você Faz)

1. Copie o backup local: `backup.sql` está em `C:\xampp\htdocs\mycocktail\`
2. No Railway, acesse MySQL → Connect
3. Use **MySQL Workbench** ou **CLI** pra importar:

```bash
mysql -h <MYSQLHOST> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < backup.sql
```

Ou via Railway UI: algumas plataformas têm import direto.

---

## Depois dessas tarefas

Avisca quando tiver feito:
1. ✅ Vercel deploy (Task 2)
2. ✅ Railway backend deploy (Task 3)
3. ✅ Railway MySQL (Task 4)
4. ✅ Dados migrados (Task 5)

Depois vou fazer:
- Task 6: Integração frontend-backend
- Task 7: Domínio próprio
- Task 8: Testes finais
