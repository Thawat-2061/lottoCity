import mysql from "mysql";

export const conn = mysql.createPool({


  connectionLimit: 10,
  host: "sql12.freemysqlhosting.net",
  user: "sql12731231",
  password: "T6FHLLJQNh",
  database: "sql12731231",

});


