import mysql from 'mysql';
import { conn } from "../dbconn";

const express = require("express");
const app = express();

app.get("/", (req: any, res: { send: (arg0: string) => any; }) => res.send("Hello World"));

app.listen(3000, () => console.log("Server ready on port 3000123"));

module.exports = app;
