import mysql from "mysql";

export const conn = mysql.createPool({
  // connectionLimit: 10,
  // host: "localhost",
  // user: "demo",
  // password: "abc123",
  // database: "test",
  connectionLimit: 10,
  host: "sql6.freemysqlhosting.net",
  user: "sql6689406",
  password: "EdBJJznbuZ",
  database: "sql6689406",

});


