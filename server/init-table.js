// create the comments table if it doesn't exist (run once before seeding comments.json data)
const pool = require("./db.config");

async function initTable() {
  await pool.query(`DROP TABLE COMMENTS;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      author VARCHAR(255) DEFAULT 'Admin',
      text TEXT NOT NULL,
      date TIMESTAMPTZ DEFAULT NOW(),
      likes INTEGER DEFAULT 0,
      image TEXT,
      parent VARCHAR(10) DEFAULT NULL
    );
  `);
  // add parent_id if table was created before this column existed
  await pool.query(`
    ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS parent VARCHAR(10) DEFAULT NULL;
  `);
  console.log("Comments table ready!");
  await pool.end();
}

initTable().catch((err) => {
  console.error(err);
  process.exit(1);
});
