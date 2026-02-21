// check openapi.yaml file for endpoint schemas

require("dotenv").config({ path: __dirname + "/.env" });
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const express = require("express");
const cors = require("cors");
const pool = require("./db.config");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 9000;

// load openapi spec from yaml file
const openapiPath = path.join(__dirname, "openapi.yaml");
const swaggerSpec = yaml.load(fs.readFileSync(openapiPath, "utf8"));
swaggerSpec.servers = [{ url: `http://localhost:${PORT}`, description: "Development server" }];

// needed to define req.body (request body)
app.use(express.json());
// enable cors for all origins (dev)
app.use(cors());

// functions
// get
const getComments = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comments");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// post
const createComment = async (req, res) => {
    try {
      const { author, text, image } = req.body;
  
      // make sure text is provided
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
  
      // sql query with database generated id
      // takes max of id and increments automatically via pg_get_serial_sequence
      const result = await pool.query(
        `INSERT INTO comments (author, text, image, date, likes)
         VALUES ($1, $2, $3, NOW(), 0)
         RETURNING *`,
        [
          author || "Admin",
          text,
          image || null
        ]
      );
  
      res.status(201).json(result.rows[0]);
  
    } catch (error) {
      console.error("CREATE COMMENT ERROR:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  };  

// put
const updateComment = async (req, res) => {
    try {
      // get parameters from path and request body
      const { id } = req.params;
      const { text, image } = req.body;
  
      // check if id is provided and valid
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID supplied" });
      }
  
      // if new text/image provided, update field, otherwise keep the same (coalesce)
      const result = await pool.query(
        `UPDATE comments
         SET text = COALESCE($1, text),
             image = COALESCE($2, image)
         WHERE id = $3
         RETURNING *`,
        [text, image, id]
      );
    
      // check comment updated successfully (found/not found)
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("UPDATE COMMENT ERROR:", error);
      res.status(500).json({ message: "Error updating comment" });
    }
  };  

// delete
  const deleteComment = async (req, res) => {
    try {
      const { id } = req.params;
  
      // check if id is provided and valid
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID supplied" });
      }
  
      // run delete query
      const result = await pool.query(
        "DELETE FROM comments WHERE id = $1 RETURNING *",
        [id]
      );
  
      // check comment deleted successfully (found/not found)
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting comment" });
    }
  };
  

// routes
app.get("/comments", getComments);
app.post("/comments", createComment);
app.put("/comments/:id", updateComment);
app.delete("/comments/:id", deleteComment);

// swagger ui
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
