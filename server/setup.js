// server/setup.js
const { Client } = require("pg");
require("dotenv").config({ path: __dirname + "/.env" });

async function setup() {
  // connect as superuser (default postgres)
  const client = new Client({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    port: 5432,
    database: "postgres",  // connect to default DB; do not use PGDATABASE from .env
  });

  await client.connect();

  // create user if not exists
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${process.env.PGUSER}') THEN
        CREATE ROLE ${process.env.PGUSER} LOGIN PASSWORD '${process.env.PGPASSWORD}';
      END IF;
    END
    $$;
  `);

  // CREATE DATABASE cannot run inside a transaction/DO block; run it as a separate query
  const dbCheck = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [process.env.PGDATABASE]
  );
  if (dbCheck.rows.length === 0) {
    await client.query(
      `CREATE DATABASE ${process.env.PGDATABASE} OWNER ${process.env.PGUSER}`
    );
  }

  console.log("User and database are ready!");
  await client.end();
}

setup();
