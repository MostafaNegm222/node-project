# Node Inventory and Invoicing API

A small REST API built with Node.js, Express and MongoDB. Users register and log in with JWT authentication, manage a product catalogue with stock levels, and create sale or purchase invoices that update stock automatically.

## What it does

**Auth (`/api/auth`)**
- `POST /register` creates a user. The password is hashed with bcrypt. Duplicate emails are rejected.
- `POST /login` checks the password and returns a JWT valid for 1 hour.

**Products (`/api/products`, token required)**
- `POST /` adds a product (`name`, `price`, `stock`, default stock is 3). A product with an existing name is rejected with a hint to update stock instead.
- `GET /` lists products.
- `PUT /:id` updates a product with schema validation. `DELETE /:id` removes it. Unknown ids return 404.

**Invoices (`/api/invoices`, token required)**
- `POST /` takes `type` (`sale` or `purchase`) and a list of `items` (`productId`, `quantity`). It checks every product exists, calculates the total from current prices, and refuses a sale when stock is not enough. On success it lowers stock for a sale or raises it for a purchase, then saves the invoice for the logged-in user.
- `GET /` lists invoices with the user name and product details filled in.

Authentication is a Bearer token in the `Authorization` header. Without one the API answers 401.

## Tech stack

Node.js, Express 4, MongoDB with Mongoose, JSON Web Tokens, bcrypt, dotenv. Tests use Jest and Supertest.

## Project structure

```
├── server.js         # Entry point: connects to MongoDB, mounts the routes
├── middleware/auth.js # JWT check
├── models/           # User, Product, Invoice
├── routes/           # auth, products, invoices
└── tests/            # Jest + Supertest tests
```

## Run it locally

You need Node.js and a running MongoDB.

```bash
npm install
```

Create a `.env` file in the project root:

```
MONGO_URI=mongodb://127.0.0.1:27017/node-project
JWT_SECRET=choose-a-long-random-string
PORT=5000
```

```bash
npm run dev     # nodemon, restarts on change
# or
npm start
```

Quick try with curl:

```bash
curl -X POST localhost:5000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","password":"secret123"}'
curl -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123"}'
```

Use the returned token as `Authorization: Bearer <token>` on the product and invoice routes.

## Tests

```bash
npm test
```

14 tests with Jest and Supertest cover the JWT middleware, register and login, and invoice creation (totals, stock going down on a sale and up on a purchase, not enough stock, unknown product, missing token). The Mongoose models are mocked, so no database is needed.

## Limits

This is a learning project. There is no input validation on registration, no roles, and the products and invoices endpoints are open to any logged-in user.
