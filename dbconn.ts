import mysql from "mysql";

export const conn = mysql.createPool({
  // connectionLimit: 10,
  // host: "localhost",
  // user: "demo",
  // password: "abc123",
  // database: "test",
  connectionLimit: 10,
  host: "202.28.34.197",
  user: "web66_65011212061",
  password: "65011212061@csmsu",
  database: "web66_65011212061",

});


