# Guia: publicar o DAJC OXL como site real

Este guia não exige saber programar. Precisas de um navegador (de preferência num computador; em telemóvel também dá, mas é mais lento). Vais usar 3 serviços gratuitos:

- **GitHub** — guarda o código
- **Supabase** — base de dados, autenticação e fotos
- **Vercel** — publica o site com um link real

---

## Parte 1 — Criar o projeto no Supabase

1. Vai a **supabase.com** → "Start your project" → cria conta (podes usar o Google).
2. "New project" → dá o nome `dajc-oxl`, escolhe uma password para a base de dados (guarda-a) e a região mais próxima (Europe/Frankfurt costuma ser boa para Angola).
3. Espera ~2 minutos até o projeto ficar pronto.
4. No menu esquerdo, vai a **SQL Editor** → **New query**.
5. Abre o ficheiro `supabase-schema.sql` (está nesta pasta), copia todo o conteúdo, cola no editor, e clica **Run**. Isto cria as tabelas, as regras de segurança e o espaço para guardar fotos.
6. Vai a **Authentication → Providers → Email** e, por agora, **desliga "Confirm email"** (assim consegues testar registos sem precisar de confirmar por e-mail). Podes voltar a ligar mais tarde.
7. Vai a **Project Settings → API**. Vais precisar de dois valores:
   - **Project URL**
   - **anon public key**

Guarda estes dois valores — vais usá-los na Parte 3.

---

## Parte 2 — Colocar o código no GitHub

1. Vai a **github.com** → cria conta gratuita, se não tiveres.
2. Clica **New repository**. Nome: `dajc-oxl`. Deixa "Public" ou "Private" (tanto faz). Clica **Create repository**.
3. Na página do repositório vazio, clica **uploading an existing file**.
4. Arrasta **todos os ficheiros e pastas** desta entrega (package.json, index.html, vite.config.js, src/, .gitignore, etc.) para essa página.
5. Clica **Commit changes**.

---

## Parte 3 — Publicar no Vercel

1. Vai a **vercel.com** → "Sign Up" → escolhe **Continue with GitHub** (liga a tua conta GitHub).
2. No painel, clica **Add New → Project**.
3. Escolhe o repositório `dajc-oxl` → **Import**.
4. Antes de clicar em Deploy, abre **Environment Variables** e adiciona:
   - `VITE_SUPABASE_URL` → cola o Project URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` → cola o anon public key do Supabase
5. Clica **Deploy**. Espera 1-2 minutos.
6. No fim, o Vercel dá-te um link tipo `https://dajc-oxl.vercel.app` — **esse é o teu site real**, funciona em qualquer navegador, em qualquer telemóvel.

---

## Parte 4 — Tornares-te administrador

1. Abre o teu site publicado e regista uma conta normal (a tua).
2. Volta ao Supabase → **SQL Editor** → corre:
   ```sql
   update public.profiles set is_admin = true where email = 'o-teu-email@exemplo.com';
   ```
3. Agora, quando entrares no site com essa conta, vais ver a opção **"Painel administrativo"** no separador Perfil — lá aprovas os pedidos de verificação KYC dos outros utilizadores e podes remover anúncios.

---

## O que já funciona de verdade

- Registo e login com e-mail e password reais (Supabase Auth)
- Anúncios guardados numa base de dados real, visíveis para qualquer visitante
- Fotos enviadas ficam guardadas de verdade (Supabase Storage)
- Verificação KYC: utilizador envia BI + selfie → fica "em análise" → só um admin aprova
- Painel administrativo real, restrito a quem tiver `is_admin = true`

## Próximos passos possíveis

- Domínio próprio (ex: `dajcoxl.ao` ou `.com`) — configurável no Vercel em "Domains"
- Chat entre comprador e vendedor
- Notificações por e-mail quando alguém contacta sobre um anúncio
- Publicar como app na Play Store/App Store (via Capacitor, depois do site estar estável)

Qualquer erro que aparecer durante o processo, tira print e mostra-me exatamente a mensagem — resolvo contigo.
