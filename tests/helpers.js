const express = require("express");

// Builds a small Express app around a router so routes can be tested without a database.
module.exports = function appWith(path, router) {
  const app = express();
  app.use(express.json());
  app.use(path, router);
  return app;
};
