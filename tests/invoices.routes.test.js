process.env.JWT_SECRET = "test-secret";
jest.mock("../models/Invoice");
jest.mock("../models/product");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const Invoice = require("../models/Invoice");
const Product = require("../models/product");
const router = require("../routes/invoices");
const app = require("./helpers")("/api/invoices", router);

const token = jwt.sign({ userId: "u1" }, "test-secret");
const post = (body) => request(app).post("/api/invoices").set("Authorization", `Bearer ${token}`).send(body);

beforeEach(() => {
  jest.resetAllMocks();
  Invoice.mockImplementation((data) => ({ ...data, save: jest.fn().mockResolvedValue() }));
});

describe("POST /api/invoices", () => {
  test("requires a token", async () => {
    const res = await request(app).post("/api/invoices").send({});
    expect(res.status).toBe(401);
  });

  test("a sale totals price x quantity and lowers stock", async () => {
    Product.findById.mockImplementation(async (id) => ({ p1: { price: 10, stock: 5 }, p2: { price: 4, stock: 9 } }[id]));
    const res = await post({
      type: "sale",
      items: [{ productId: "p1", quantity: 2 }, { productId: "p2", quantity: 3 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(32);
    expect(res.body.userId).toBe("u1");
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p1", { $inc: { stock: -2 } });
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p2", { $inc: { stock: -3 } });
  });

  test("a purchase raises stock", async () => {
    Product.findById.mockResolvedValue({ price: 10, stock: 0 });
    const res = await post({ type: "purchase", items: [{ productId: "p1", quantity: 7 }] });
    expect(res.status).toBe(201);
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p1", { $inc: { stock: 7 } });
  });

  test("a sale is refused when there is not enough stock, and stock is untouched", async () => {
    Product.findById.mockResolvedValue({ price: 10, stock: 1 });
    const res = await post({ type: "sale", items: [{ productId: "p1", quantity: 2 }] });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Not enough stock");
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test("404 when a product does not exist", async () => {
    Product.findById.mockResolvedValue(null);
    const res = await post({ type: "sale", items: [{ productId: "nope", quantity: 1 }] });
    expect(res.status).toBe(404);
  });
});
