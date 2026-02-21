// pg to create a connection pool, 
// which is basically a cache of database connections maintained for efficient reuse in future database requests.
// server/db.config.js
const { Pool } = require("pg");
require("dotenv").config({ path: __dirname + "/.env" });

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "pern_example",
  password: process.env.PGPASSWORD || "12345678",
  port: process.env.PGPORT || 5432,
});

module.exports = pool;
