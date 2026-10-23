# 🚀 Guia Completo - Deploy MyFirstCocktail no Railway

Seu site está **100% pronto**. Você só precisa fazer 3 coisas simples no Railway. Vou explicar cada uma.

---

## ✅ Checklist de Tarefas

- [ ] Tarefa 1: Criar conta no Railway
- [ ] Tarefa 2: Deploy do Projeto (Código)
- [ ] Tarefa 3: Criar Banco de Dados MySQL
- [ ] Tarefa 4: Importar dados (backup.sql)
- [ ] Tarefa 5: Configurar domínio (opcional)

---

## 📋 Tarefa 1: Criar Conta no Railway (5 minutos)

### Passo 1.1 - Abrir Railway
1. Acesse: **https://railway.app**
2. Clique em **"Sign Up"** (canto superior direito)

### Passo 1.2 - Escolher forma de cadastro
- Recomendo: **GitHub** (mais fácil)
- Clique em **"Continue with GitHub"**
- Autorize a conexão

### Passo 1.3 - Pronto!
Você está conectado. Próximo passo!

---

## 📋 Tarefa 2: Deploy do Projeto (10 minutos)

### Passo 2.1 - Criar novo projeto no Railway
1. Na página inicial do Railway, clique em **"Create New Project"**
2. Selecione **"Deploy from GitHub"**
3. Se não vir seu repositório, clique em **"Create Empty Project"** (usaremos CLI depois)

### Passo 2.2 - Conectar com seu GitHub (se tiver o repo lá)
1. Clique em "Deploy from GitHub"
2. Procure o repositório `site myfirstcocktail`
3. Clique em **"Deploy"**

**OU** - Se ainda não tem no GitHub:

1. Abra terminal/PowerShell
2. Entre na pasta do site:
   ```
   cd D:\Projetos-claude-code\site myfirstcocktail
   ```
3. Fazer push inicial:
   ```
   git remote add origin https://github.com/SEU_USUARIO/site-myfirstcocktail.git
   git branch -M main
   git push -u origin main
   ```
4. Volte ao Railway e faça o deploy acima

### Passo 2.3 - Configurar variáveis de ambiente
No painel do Railway, após deploy:

1. Clique na aba **"Variables"**
2. Adicione:
   ```
   PORT=3000
   NODE_ENV=production
   ```
3. **Não adicione MYSQL_ ainda** (fazemos na próxima tarefa)

### Passo 2.4 - Esperar build
- Railway vai compilar o projeto automaticamente
- Procure mensagem de sucesso: ✓ "Deployment successful"
- Copie o domínio temporário (algo como: `myfirstcocktail-prod.up.railway.app`)

---

## 📋 Tarefa 3: Criar Banco de Dados MySQL (5 minutos)

### Passo 3.1 - Adicionar MySQL ao projeto
1. No painel do Railway, clique em **"Add Service"**
2. Procure **"MySQL"**
3. Clique em **"Add MySQL"**
4. Railway cria o banco automaticamente

### Passo 3.2 - Copiar credenciais do banco
1. Clique no serviço MySQL (lado esquerdo)
2. Vá para aba **"Variables"**
3. Você verá:
   - `MYSQL_HOST` 
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

4. **Copie todos esses valores**

### Passo 3.3 - Adicionar ao seu projeto
1. Volte para o serviço Node.js/Express
2. Vá em **"Variables"**
3. Adicione as 4 variáveis que você copiou

**Exemplo:**
```
MYSQL_HOST=monorail.proxy.rlwy.net
MYSQL_USER=root
MYSQL_PASSWORD=ABC123xyz...
MYSQL_DATABASE=railway
PORT=3000
NODE_ENV=production
```

---

## 📋 Tarefa 4: Importar Dados (10 minutos)

### Passo 4.1 - Acessar o MySQL do Railway
1. No painel do MySQL (Railway), copie a string de conexão
2. Abra seu cliente MySQL favorito:
   - **MySQL Workbench** (grátis)
   - Ou use linha de comando

### Passo 4.2 - Importar backup.sql
Usando **MySQL Workbench**:
1. Server → Data Import
2. Select "Import from Self-Contained File"
3. Clique em "..."
4. Procure e selecione: `backup.sql` (na pasta do projeto)
5. Em "Default Target Schema": selecione seu banco `railway` (ou qual for)
6. Clique em "Start Import"

**Ou pela linha de comando:**
```powershell
mysql -h SEU_HOST -u SEU_USER -p SEU_PASSWORD < backup.sql
```

### Passo 4.3 - Verificar dados
Após importar, execute no MySQL:
```sql
SHOW TABLES;
SELECT COUNT(*) FROM recipes;
```

Você deve ver suas tabelas e dados importados! ✓

---

## ✅ Pronto! Seu site está no ar!

Acesse: `https://seu-dominio-railway.app`

Se não funcionar, verifique:
1. Build passou sem erros (aba "Build" no Railway)
2. Banco de dados está conectado (aba "Variables")
3. Backup foi importado (execute `SHOW TABLES;`)

---

## 📋 Tarefa 5: Domínio Próprio (Opcional - 5 minutos depois)

Se quiser seu próprio domínio (exemplo: `seudominio.com`):

### No Railway:
1. Clique no projeto Express
2. Aba **"Settings"**
3. **"Domains"** → Clique **"Add Domain"**
4. Digite seu domínio: `seudominio.com`
5. Railway mostra os registros DNS necessários

### No seu registrador (GoDaddy, Namecheap, etc):
1. Vá para DNS settings
2. Adicione o registro CNAME que Railway mostrou
3. Aguarde 24h (ou menos) para propagar

---

## 🔧 Troubleshooting

**"Deployment failed"**
- Verifique se `package.json` está correto
- Clique em "Build Logs" para mais detalhes

**"Cannot connect to database"**
- Verifique MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD nas Variables
- Confirme que o MySQL foi criado no Railway

**"Uploads não funcionam"**
- Railway reinicia containers frequentemente
- Considere usar storage em nuvem (AWS S3, Supabase) depois

---

## ❓ Dúvidas?

Se algo não funcionar, me avise! Posso:
- Verificar os logs do Railway
- Reconfigurar as variáveis
- Ajustar o código se necessário

**Próximo passo:** Faça as Tarefas 1-4 acima. Quando terminar, é só me avisar! 🎉
