# 🚀 Guia Passo-a-Passo: Deploy do MyFirstCocktail

## O que você tem agora?
- ✅ Dados no Supabase (receitas, licores, xaropes, copos, ingredientes)
- ✅ Site testado localmente (npm run preview)
- ⏳ Falta: colocar na internet no Vercel

---

## Passo 1: Instalar Vercel CLI

**O que é:** Programa que permite fazer upload do site para internet

### Windows:
1. Abra **PowerShell** (clique com botão direito do mouse > "Executar como administrador")
2. Cole isto e pressione ENTER:
```powershell
npm install -g vercel
```
3. Espere terminar (pode levar 1-2 minutos)

---

## Passo 2: Fazer Login no Vercel

1. No PowerShell, cole e pressione ENTER:
```powershell
vercel login
```

2. Vai abrir navegador pedindo para logar
3. Se não tiver conta, crie rápido (clique em "Sign Up")
4. Completa o login
5. Volta ao PowerShell - deve dizer "✓ Email confirmed"

---

## Passo 3: Navegar para pasta do projeto

1. No PowerShell, cole:
```powershell
cd "D:\Projetos-claude-code\site myfirstcocktail"
```

2. Pressione ENTER

---

## Passo 4: Fazer Deploy

1. Cole isto:
```powershell
vercel --prod
```

2. Vai fazer perguntas. Responda assim:

**"Set up and deploy "D:\Projetos-claude-code\site myfirstcocktail"?"**
- Resposta: `y` (sim)
- Pressione ENTER

**"Which scope should contain your project?"**
- Deixe padrão, pressione ENTER

**"Found project settings in vercel.json. Continuing with those settings."**
- Vai aparecer automaticamente

**"Environment variables"**
- Se perguntar sobre variáveis, responda `yes` ou `y`

3. **Agora a parte importante:** Quando perguntar sobre env vars, você precisa adicionar 2:

   **Nome:** `VITE_SUPABASE_URL`
   **Valor:** `https://vztlsfppfesdqhjzdfpj.supabase.co`

   **Nome:** `VITE_SUPABASE_ANON_KEY`
   **Valor:** `sb_publishable_EzW-ynXhs_1XWBTiL0osCw_n2Zs4nm_`

4. Aguarde até ver:
```
✓ Production: https://site-myfirstcocktail.vercel.app
```

**Pronto! Seu site está na internet!**

---

## Passo 5: Testar o site

1. Copie a URL que apareceu (tipo: `https://site-myfirstcocktail.vercel.app`)
2. Abra no navegador
3. Verifique se:
   - ✅ Receitas aparecem
   - ✅ Imagens dos copos carregam
   - ✅ Imagens dos licores carregam
   - ✅ Imagens dos xaropes carregam

Se tudo funcionar = **sucesso!**

---

## Se der erro...

### Erro: "Permission denied"
- Rode PowerShell como administrador (botão direito)

### Erro: "vercel not found"
- Rode de novo:
```powershell
npm install -g vercel
```

### Site está no ar mas imagens não aparecem
- Abra F12 (console do navegador)
- Procure por erros vermelhos
- Me mande o erro

### Site não carrega nada
- Aguarde 5 minutos (deploy pode levar tempo)
- Recarregue página (F5)

---

## Resumo do que você fez:

1. ✅ Criou dados no Supabase (receitas, licores, etc)
2. ✅ Testou localmente
3. ✅ Agora: colocou na internet no Vercel

**Seu site agora está acessível de qualquer lugar do mundo!**

---

## Próximas vezes que você quiser atualizar:

Se mudar algo no código e quiser atualizar o site:

```powershell
cd "D:\Projetos-claude-code\site myfirstcocktail"
vercel --prod
```

Pronto! Site atualiza automaticamente.

---

## Dúvidas?

Se ficar preso em algum passo, me manda:
- O comando que você rodou
- O erro exato que apareceu
- Print da tela se precisar
