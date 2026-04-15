# QR Link Generator - Guida Setup Completa

## Prerequisiti

- **Node.js** >= 20 (consigliato 22+)
- **npm** >= 10
- **Git**

---

## 1. Setup Locale (Sviluppo)

### 1.1 Clona e installa

```bash
git clone <url-del-repo>
cd biauto-qr
npm install
```

### 1.2 Configura le variabili d'ambiente

Crea il file `.env` nella root del progetto:

```env
# Database - SQLite locale per sviluppo
DATABASE_URL="file:./dev.db"

# Auth.js - Segreto per firmare i token JWT
# In dev puoi lasciare questo, in prod DEVI cambiarlo (vedi sezione Produzione)
AUTH_SECRET="change-me-to-a-random-secret-in-production"

# URL base dell'app - usato per generare i link dei QR code
AUTH_URL="http://localhost:3000"
```

### 1.3 Inizializza il database

```bash
# Genera il client Prisma (necessario dopo ogni modifica allo schema)
npx prisma generate

# Crea il database e applica le migrazioni
npx prisma migrate dev
```

### 1.4 Avvia il server di sviluppo

```bash
npm run dev
```

Apri http://localhost:3000 nel browser.

### 1.5 Primo utilizzo

1. Vai su http://localhost:3000/register
2. Crea un account con email e password
3. Verrai reindirizzato alla dashboard
4. Crea il tuo primo QR code da "Nuovo QR"

---

## 2. Setup Produzione

### 2.1 Genera il segreto AUTH_SECRET

Questo e fondamentale per la sicurezza. Genera una stringa casuale:

```bash
# Metodo 1: con openssl
openssl rand -base64 32

# Metodo 2: con node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia l'output e usalo come valore di `AUTH_SECRET`.

### 2.2 Configura `.env` per produzione

```env
# Database - percorso assoluto per il file SQLite in produzione
DATABASE_URL="file:/var/data/biauto-qr/prod.db"

# Auth.js - segreto UNICO per produzione (generato al passo 2.1)
AUTH_SECRET="la-tua-stringa-casuale-generata-qui"

# URL pubblico del tuo sito (SENZA slash finale)
AUTH_URL="https://qr.tuodominio.com"
```

> **IMPORTANTE**: `AUTH_URL` deve corrispondere ESATTAMENTE al dominio pubblico.
> I QR code generati conterranno link del tipo `https://qr.tuodominio.com/r/abc123`.
> Se cambi dominio, i QR code gia stampati continueranno a puntare al vecchio URL.

### 2.3 Build e avvio

```bash
# Installa le dipendenze (senza devDependencies in prod)
npm ci

# Genera il client Prisma
npx prisma generate

# Applica le migrazioni al database di produzione
npx prisma migrate deploy

# Build dell'applicazione
npm run build

# Avvia il server di produzione
npm start
```

Il server parte sulla porta 3000 di default.
Per cambiare porta:

```bash
PORT=8080 npm start
```

---

## 3. Deploy su VPS / Server dedicato

### 3.1 Con PM2 (consigliato)

PM2 mantiene l'app attiva, la riavvia se crasha, e gestisce i log.

```bash
# Installa PM2 globalmente
npm install -g pm2

# Dalla cartella del progetto, dopo la build:
pm2 start npm --name "qr-generator" -- start

# Comandi utili
pm2 status              # stato dell'app
pm2 logs qr-generator   # vedi i log
pm2 restart qr-generator # riavvia
pm2 stop qr-generator    # ferma

# Auto-avvio al reboot del server
pm2 startup
pm2 save
```

### 3.2 Con Docker

Crea un `Dockerfile` nella root:

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /var/data && chown nextjs:nodejs /var/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Per usare Docker, aggiungi `output: "standalone"` in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

Poi:

```bash
# Build dell'immagine
docker build -t qr-generator .

# Avvia il container
docker run -d \
  --name qr-generator \
  -p 3000:3000 \
  -v qr-data:/var/data \
  -e DATABASE_URL="file:/var/data/prod.db" \
  -e AUTH_SECRET="il-tuo-segreto" \
  -e AUTH_URL="https://qr.tuodominio.com" \
  qr-generator

# Applica le migrazioni dentro il container
docker exec qr-generator npx prisma migrate deploy
```

### 3.3 Reverse Proxy con Nginx

```nginx
server {
    listen 80;
    server_name qr.tuodominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name qr.tuodominio.com;

    ssl_certificate     /etc/letsencrypt/live/qr.tuodominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qr.tuodominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Certificato SSL con Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d qr.tuodominio.com
```

---

## 4. Deploy su Vercel

### 4.1 Problema: SQLite non funziona su Vercel

Vercel e serverless - il filesystem non e persistente.
Hai due opzioni:

**Opzione A: Turso (SQLite remoto - consigliato)**

```bash
# Installa Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Crea un database
turso db create qr-generator
turso db show qr-generator --url    # copia l'URL
turso db tokens create qr-generator  # copia il token
```

Cambia l'adapter in `src/lib/prisma.ts`:

```typescript
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const prisma = new PrismaClient({ adapter });
```

Installa il nuovo adapter:

```bash
npm uninstall @prisma/adapter-better-sqlite3
npm install @prisma/adapter-libsql
```

Variabili su Vercel:

```
DATABASE_URL=libsql://tuo-db-turso.turso.io
DATABASE_AUTH_TOKEN=token-generato
AUTH_SECRET=il-tuo-segreto
AUTH_URL=https://qr.tuodominio.com
```

**Opzione B: PostgreSQL (Neon/Supabase)**

Migra da SQLite a PostgreSQL cambiando il provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
}
```

E l'adapter in `src/lib/prisma.ts`:

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```

### 4.2 Deploy

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configura le variabili d'ambiente su Vercel Dashboard:
# Settings > Environment Variables > aggiungi tutte le variabili .env
```

---

## 5. Checklist Pre-Produzione

```
[ ] AUTH_SECRET generato con openssl (NON usare quello di default)
[ ] AUTH_URL impostato sul dominio pubblico reale
[ ] DATABASE_URL punta al database di produzione
[ ] HTTPS configurato (certificato SSL)
[ ] Nginx/reverse proxy configurato con header X-Forwarded-For
[ ] Database migrato (npx prisma migrate deploy)
[ ] Client Prisma generato (npx prisma generate)
[ ] Build completata senza errori (npm run build)
[ ] Primo account utente creato via /register
[ ] Test: creare un QR, scansionarlo, verificare redirect
[ ] Test: modificare URL di destinazione e verificare il cambio
[ ] Backup database automatizzato (cron job per copiare il file .db)
```

---

## 6. Backup Database SQLite

SQLite e un singolo file. Basta copiarlo.

```bash
# Backup manuale
cp /var/data/biauto-qr/prod.db /backup/qr-$(date +%Y%m%d).db

# Cron job per backup giornaliero (aggiungi con: crontab -e)
0 3 * * * cp /var/data/biauto-qr/prod.db /backup/qr-$(date +\%Y\%m\%d).db
```

---

## 7. Aggiornamenti

Quando modifichi il codice e vuoi aggiornare in produzione:

```bash
git pull origin main
npm ci
npx prisma generate
npx prisma migrate deploy   # solo se hai nuove migrazioni
npm run build
pm2 restart qr-generator    # oppure: docker restart qr-generator
```

---

## Struttura Variabili d'Ambiente

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | Si | Connessione al database. `file:./dev.db` per SQLite locale |
| `AUTH_SECRET` | Si | Segreto per firmare i JWT. Minimo 32 caratteri random |
| `AUTH_URL` | Si | URL pubblico dell'app. Usato nei QR code e per i redirect auth |
