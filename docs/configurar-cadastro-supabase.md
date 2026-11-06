# Configurar o cadastro de visitantes no Supabase

Dois ajustes no painel que **não dá para fazer pelo código**. Sem eles o
cadastro funciona no site mas os e-mails chegam com links quebrados.

Projeto: `vztlsfppfesdqhjzdfpj`

---

## 1. Liberar os endereços de retorno (obrigatório)

O código manda o Supabase devolver a pessoa para o endereço de onde ela veio
(`window.location.origin`), tanto no link de confirmação de conta quanto no de
redefinição de senha. Mas o Supabase **ignora qualquer endereço que não esteja
na lista de permitidos** e cai na "Site URL" — que hoje aponta para o
localhost. Resultado prático: quem confirma a conta pelo celular cai numa
página que não abre.

Onde: **Authentication > URL Configuration**
https://supabase.com/dashboard/project/vztlsfppfesdqhjzdfpj/auth/url-configuration

- **Site URL:** `https://site-myfirstcocktail.vercel.app`
- **Redirect URLs** (adicionar as duas):
  - `https://site-myfirstcocktail.vercel.app/**`
  - `http://localhost:3000/**`

O `/**` no fim cobre qualquer caminho dentro do site. O localhost fica para
continuar testando o fluxo na máquina.

---

## 2. Limite de e-mails (ler antes de divulgar o site)

O servidor de e-mail que vem junto com o Supabase é só para desenvolvimento:
**poucas mensagens por hora**, e o Supabase não garante entrega. Enquanto o
site tiver pouco movimento, funciona. Se o cadastro começar a falhar com
"rate limit", é isso — não é bug do site.

A saída é ligar um servidor de e-mail próprio (SMTP) em
**Authentication > Emails > SMTP Settings**. Serviços como Resend, Brevo ou
SendGrid têm plano gratuito suficiente para este caso.

---

## 3. Textos dos e-mails (opcional)

Os e-mails de confirmação e de recuperação saem em inglês, com o texto padrão
do Supabase. Dá para reescrevê-los em português em
**Authentication > Emails > Templates** — vale a pena, já que o site todo é em
português e o e-mail é o primeiro contato depois do cadastro.

---

## Como conferir que ficou certo

1. No site, criar uma conta com um e-mail real seu.
2. O e-mail deve chegar e o link deve abrir **o site publicado**, não o
   localhost.
3. Depois de confirmar, entrar e clicar no coração de uma receita.
4. Recarregar a página: o coração continua aceso.
5. Sair da conta e entrar de novo: o favorito continua lá.
6. Em "Esqueci minha senha", pedir o link, abrir pelo e-mail — o site deve
   abrir direto na tela de criar nova senha.
