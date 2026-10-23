# Como obter a Service Role Key

1. **Abra o Supabase Dashboard:**
   https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/settings/api

2. **Encontre a seção "Project API keys"**

3. **Copie a chave "service_role" (a chave longa que começa com "eyJ")**

4. **Configure a variável de ambiente e execute:**

```powershell
# PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY = "cole-a-chave-aqui"
node auto_setup.js --seed
```

Ou crie arquivo `.env.local.service` com:
```
SUPABASE_SERVICE_ROLE_KEY=cole-a-chave-aqui
```

E execute:
```bash
node -r dotenv/config auto_setup.js --seed dotenv_config_path=.env.local.service
```

Sem a service role key, faça manualmente:

1. Copie o SQL de setup.sql
2. Abra: https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/sql/new
3. Cole e execute
4. Depois execute: node auto_setup.js --seed
