import mysql from "mysql";

export const conn = mysql.createPool({


  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212061",
  password: "65011212061@csmsu",
  database: "web66_65011212061",

  // connectionLimit: 10,
  // host: "sql12.freemysqlhosting.net",
  // user: "sql12731231",
  // password: "T6FHLLJQNh",
  // database: "sql12731231",

});


