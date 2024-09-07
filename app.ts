import express from "express";
import { router as people } from "./api/people";
import bodyParser from "body-parser";
import { router as movie } from "./api/movies";
import { router as stars } from "./api/stars";
import { router as creators } from "./api/creators";
import { router as login } from "./api/login";

export const app = express();

const cors = require('cors');
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

// Register your routes first
app.use("/people", people);
app.use("/movie", movie);
app.use("/stars", stars);
app.use("/creators", creators);
app.use("/login", login);

// The root route should be the last
app.use("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/:input", (req, res) => {
  const input = req.params.input; // พารามิเตอร์ input จะเป็นได้ทั้ง email หรือ username

  // ปรับ SQL ให้รองรับทั้ง email และ username
  let sql = "SELECT * FROM members WHERE email = ? OR username = ?";

  conn.query(sql, [input, input], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(result);
    }
  });
});
