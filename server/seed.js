// seed comments.json file as starting data
const pool = require("./db.config");
const fs = require("fs");

const file = JSON.parse(fs.readFileSync("./comments.json", "utf-8"));
const comments = file.comments;

async function seed() {
  for (const comment of comments) {
    await pool.query(
      `INSERT INTO comments (id, author, text, date, likes, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        parseInt(comment.id),
        comment.author,
        comment.text,
        comment.date,
        comment.likes,
        comment.image || null,
      ]
    );
  }

  console.log("Comments seeded successfully!");
  await pool.end();
}

seed();
