# `neo.pujas.live`

## Quick Start

Install [Docker](https://docs.docker.com/get-docker/) and
[docker-compose](https://docs.docker.com/compose/install/). Then:

```sh
git clone https://github.com/mahadana/neo.pujas.live.git
cd neo.pujas.live
docker-compose up
```

Browse to http://localhost:3000/ for the application.  
Browse to http://localhost:1337/admin/ for the admin.

The default credentials (for both):

- Email: `admin@pujas.live`
- Password: `Password1`

## Email

If you wish to test the email functionality, create an account with
[Mailtrap](https://mailtrap.io/) and add the secrets to `backend/.env`:

```
MAILTRAP_USER=...
MAILTRAP_PASSWORD=...
```

## Useful Commands

```sh
# Spawn a shell on the frontend
./shell frontend # or backend, db, frontend, redis, worker

# Install an npm module on the frontend
./shell frontend npm install --save <module>

# Spawn a strapi console
./shell backend npx -c 'PORT=1338 strapi console'

# Restart from scratch
docker-compose down
docker volume rm $(docker volume ls -q | grep pujaslive)
docker volume prune -f
rm -rf backend/.cache backend/.tmp backend/build \
       backend/exports backend/node_modules \
       frontend/.next frontend/node_modules \
       worker/build worker/node_modules
docker-compose up
```

## Server Setup

```sh
wget -qO- 'https://raw.githubusercontent.com/mahadana/neo.pujas.live/main/server/setup.sh' | bash
```

Edit `backend/.env`:

```
ADMIN_JWT_SECRET=...
ADMIN_PASSWORD=...
JWT_SECRET=...
MAILJET_PUBLIC_KEY=...
MAILJET_SECRET_KEY=...
```

You can create JWT secrets with:

```sh
openssl rand -hex 32
```

To completely restart from on scratch:

```sh
cd /opt/neo.pujas.live
docker-compose down
docker volume rm $(docker volume ls -q | grep neopujaslive)
docker-compose -f docker-compose.production.yml up -d
```
