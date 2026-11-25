# Node Inventory and Invoicing API

## 1. Description

A small REST API for inventory and invoicing, built with Node.js, Express and MongoDB. It solves a common small-business problem: keeping a product catalogue with stock levels and recording sale and purchase invoices that update stock automatically. Users register and log in with JWT authentication; sale invoices are refused when stock is not enough.

## 2. Technologies and Versions

- Node.js with Express ^4.21.2
- MongoDB with Mongoose ^8.10.1 (mongodb driver ^6.13.0)
- JSON Web Tokens ^9.0.2 (auth)
- bcrypt ^5.1.1 and bcryptjs ^3.0.2 (password hashing)
- dotenv ^16.4.7
- Jest ^30.5.2 and Supertest ^7.3.2 (tests), nodemon ^3.1.9 (dev)

## 3. Requirements and Dependencies

- Node.js installed
- A running MongoDB instance (local or Atlas)
- Dependencies are installed with `npm install` (see `package.json`)

## 4. Installation and Run Steps

```bash
git clone https://github.com/MostafaNegm222/node-project.git
cd node-project
npm install
```

Create a `.env` file in the project root (see section 5), then:

```bash
npm run dev     # nodemon, restarts on change
# or
npm start       # node server.js
```

The API listens on `PORT` (default 5000).

## 5. Environment Variables

Defined in a `.env` file in the project root (no secrets are stored in the repo):

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `PORT` | Port the API listens on (optional, default 5000) |

## 6. Usage and Main Features

Authenticate with a Bearer token in the `Authorization` header; without one the API answers 401.

- **Auth (`/api/auth`)**: `POST /register` creates a user (bcrypt-hashed password, duplicate emails rejected). `POST /login` returns a JWT valid for 1 hour.
- **Products (`/api/products`, token required)**: add products (`name`, `price`, `stock`, default stock 3), list them, update with schema validation, delete. A product with an existing name is rejected with a hint to update stock instead.
- **Invoices (`/api/invoices`, token required)**: `POST /` takes `type` (`sale` or `purchase`) and `items` (`productId`, `quantity`); it verifies every product, calculates the total from current prices, refuses sales with insufficient stock, then lowers stock for a sale or raises it for a purchase. `GET /` lists invoices with user and product details filled in.

Quick try:

```bash
curl -X POST localhost:5000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","password":"secret123"}'
curl -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}'
```

## 7. Screenshots / Demo

No live demo; the API runs locally.

## 8. Running Tests

```bash
npm test
```

Jest + Supertest tests cover the JWT middleware, registration/login and the product and invoice routes (see `tests/`).
