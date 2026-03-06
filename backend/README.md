# Quiz Backend

Backend for a Quiz app (Express + MongoDB).

## Project structure

- `src/app.js` - express app (middlewares + routes)
- `src/server.js` - bootstrap (env + db + listen)
- `src/config/` - env and db config
- `src/modules/` - feature modules (routes/controller/service/validation/model)
- `src/middlewares/` - common middlewares
- `src/utils/` - helpers
- `src/docs/swagger.js` - swagger setup

## Setup

1. Create `.env` from the example below (or use the provided `.env`).
2. Install deps:

```bash
npm i
```

3. Run:

```bash
npm run dev
```

## Environment

Example:

```bash
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/quiz
JWT_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

