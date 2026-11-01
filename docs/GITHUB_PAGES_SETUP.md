# Setup GitHub Pages - Guia Passo a Passo

## 1. Abra as Settings do Repositório

Acesse: https://github.com/efreitas1963/site-myfirstcocktail/settings

## 2. Procure por "Pages" no menu à esquerda

Clique em **"Pages"** (aparece na coluna esquerda sob "Code and automation")

## 3. Configure o Source (Build and deployment)

Na seção "Source", você verá:

**Opção A - Se estiver em "None":**
1. Clique no dropdown que diz "None"
2. Selecione **"GitHub Actions"**
3. Clique "Save"

**Opção B - Se estiver em "Deploy from a branch":**
1. Clique no dropdown
2. Selecione **"GitHub Actions"**
3. Clique "Save"

## 4. Pronto!

GitHub vai:
- Detectar o arquivo `.github/workflows/deploy.yml`
- Rodar automaticamente quando você faz push
- Publicar em: `https://efreitas1963.github.io/site-myfirstcocktail`

## Verificar Status do Build

Acesse: https://github.com/efreitas1963/site-myfirstcocktail/actions

Você verá:
- ✅ Green check = deployment bem-sucedido
- ❌ Red X = erro no build

Se der erro, clique na linha vermelha para ver o que aconteceu.

## Acessar o Site

Após o build completar (~2 minutos), acesse:

**https://efreitas1963.github.io/site-myfirstcocktail**

Pronto! Site está no ar! 🎉
