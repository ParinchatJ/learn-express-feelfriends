const knex = require("knex");

const db = knex.default({
  client: "mysql2",
  connection: {
    user: "root",
    password: "root",
    host: "127.0.0.1",
    port: 8889,
    database: "express_feelfriends",
    timezone: "+00:00",
  },
});

module.exports = db;
