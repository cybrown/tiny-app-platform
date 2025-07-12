# Tiny app platform

TAP is a platform to create small appps.

## Installation

Use npm.

```bash
npm ci
npm run build
```

## Usage

### Start all packages and watch libs

Starts all packages with turborepo

```bash
npm start
```

Go to http://localhost:3000

### Start backend and webclient independently

```bash
cd packages/web-client
npm start
```

```bash
cd packages/backend
npm start
```

### To enable storage support

```bash
docker compose up -d
```

```bash
echo "MONGODB_URI=mongodb://localhost:20001" > packages/backend/.env
```

Check mongo-ui here: http://localhost:3003/ (creds: admin/admin)
