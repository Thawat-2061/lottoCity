import express from "express";
import bodyParser from "body-parser";
import { router as login } from "./api/login";
import { router as lottoryNumber } from "./api/lottoryNumber";
import { router as randomLot } from "./api/randomLot";

export const app = express();

const cors = require('cors');
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

// Register your routes first

app.use("/login", login);
app.use("/lottoryNumber", lottoryNumber);
app.use("/randomLot", randomLot);


// The root route should be the last
app.use("/", (req, res) => {
  res.send("Hello World!");
});