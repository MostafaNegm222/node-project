process.env.JWT_SECRET = "test-secret";
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

function run(headers = {}) {
  const req = { header: (name) => headers[name] };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  auth(req, res, next);
  return { req, res, next };
}

describe("auth middleware", () => {
  test("rejects a request without an Authorization header", () => {
    const { res, next } = run();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a header with no token after the scheme", () => {
    const { res } = run({ Authorization: "Bearer" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied. Invalid token format." });
  });

  test("rejects a token signed with another secret", () => {
    const bad = jwt.sign({ userId: "1" }, "other-secret");
    const { res, next } = run({ Authorization: `Bearer ${bad}` });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts a valid token and puts the payload on req.user", () => {
    const token = jwt.sign({ userId: "abc123" }, "test-secret");
    const { req, next } = run({ Authorization: `Bearer ${token}` });
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe("abc123");
  });
});
