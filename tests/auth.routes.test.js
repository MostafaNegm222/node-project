process.env.JWT_SECRET = "test-secret";
jest.mock("../models/user.js");

const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const router = require("../routes/auth");
const app = require("./helpers")("/api/auth", router);

beforeEach(() => jest.resetAllMocks());

describe("POST /api/auth/register", () => {
  test("rejects an email that already exists", async () => {
    User.findOne.mockResolvedValue({ email: "a@b.com" });
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "a@b.com", password: "pw" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("User Already Exists");
  });

  test("hashes the password before saving", async () => {
    User.findOne.mockResolvedValue(null);
    let saved;
    User.mockImplementation((data) => {
      saved = data;
      return { ...data, save: jest.fn().mockResolvedValue() };
    });
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "a@b.com", password: "plain-pw" });
    expect(res.status).toBe(201);
    expect(saved.password).not.toBe("plain-pw");
    expect(await bcrypt.compare("plain-pw", saved.password)).toBe(true);
  });
});

describe("POST /api/auth/login", () => {
  const lean = (value) => ({ lean: () => Promise.resolve(value) });

  test("404 for an unknown email", async () => {
    User.findOne.mockReturnValue(lean(null));
    const res = await request(app).post("/api/auth/login").send({ email: "x@y.com", password: "pw" });
    expect(res.status).toBe(404);
  });

  test("404 for a wrong password", async () => {
    User.findOne.mockReturnValue(lean({ _id: "u1", password: await bcrypt.hash("right", 4) }));
    const res = await request(app).post("/api/auth/login").send({ email: "x@y.com", password: "wrong" });
    expect(res.status).toBe(404);
  });

  test("returns a JWT for the right password", async () => {
    User.findOne.mockReturnValue(lean({ _id: "u1", password: await bcrypt.hash("right", 4) }));
    const res = await request(app).post("/api/auth/login").send({ email: "x@y.com", password: "right" });
    expect(res.status).toBe(200);
    expect(jwt.verify(res.body.token, "test-secret").userId).toBe("u1");
  });
});
