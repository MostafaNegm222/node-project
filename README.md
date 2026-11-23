# Node REST API

A Node.js + Express REST API with MongoDB, featuring JWT authentication.

## Tech Stack

- **Runtime/Framework:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with bcrypt password hashing

## Project Structure

```
├── models/      # Mongoose models
├── routes/      # API routes
├── middleware/  # Express middleware
└── server.js    # Entry point
```

## Getting Started

```bash
npm install
# add a .env with MONGO_URI and JWT_SECRET
npm run dev
```
