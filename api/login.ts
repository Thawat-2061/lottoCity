import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง
import { RegisterPostRequest } from '../model/registerModel';

export const router = express.Router();

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

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post("/", async (req, res) => {
  let User = req.body;

  // ตรวจสอบให้แน่ใจว่าฟิลด์ที่จำเป็นทั้งหมดมีค่า
  if (!User.username || !User.email || !User.password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(User.password, saltRounds);
    const walletBalance = User.wallet_balance == null ? 80.00 : User.wallet_balance;

    // ตรวจสอบว่าชื่อผู้ใช้มีอยู่แล้วหรือไม่
    let checkUserSql = "SELECT COUNT(*) AS count FROM `members` WHERE `username` = ?";
    checkUserSql = mysql.format(checkUserSql, [User.username]);

    conn.query(checkUserSql, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error." });
      }

      if (result[0].count > 0) {
        return res.status(409).json({ error: "Username already exists. Please choose a different username." });
      } else {
        // เพิ่มผู้ใช้ใหม่
        let sql =
          "INSERT INTO `members`(`username`, `email`, `password`, `wallet_balance`, `type`) VALUES (?,?,?,?,?)";
        sql = mysql.format(sql, [User.username, User.email, hashedPassword, walletBalance, User.type]);

        conn.query(sql, (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Failed to register user." });
          }
          res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});


router.put("/:member_id", async (req, res) => {
  try {
    const member_id = req.params.member_id; // รับค่าจาก URL parameter
    const member = req.body; // รับข้อมูลสมาชิกจาก request body

    // ตรวจสอบข้อมูลก่อนการอัพเดต
    if (!member.username || !member.email || !member.newpassword) {
      return res.status(400).json({ message: "Invalid data provided." });
    }

    // แฮชรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(member.newpassword, saltRounds);

    // เตรียมคำสั่ง SQL สำหรับการอัพเดตข้อมูล
    let sql =
      "UPDATE members SET username = ?, email = ?, password = ? WHERE member_id = ?";

    sql = mysql.format(sql, [
      member.username,
      member.email,
      hashedPassword,
      member_id,
    ]);

    // ทำการอัพเดตข้อมูลในฐานข้อมูล
    conn.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing query:", err.message);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }

      // ตรวจสอบว่ามีการอัพเดตข้อมูลกี่แถว
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Member not found." });
      }

      // ส่งสถานะตอบกลับเมื่อการอัพเดตสำเร็จ
      res.status(200).json({
        message: "Member updated successfully",
        affected_rows: result.affectedRows,
      });
    });
  } catch (error) {
    // ใช้ Type Assertion เพื่อระบุว่าประเภทของ error คือ Error
    console.error("Error:", (error as Error).message);
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
});

router.delete("/:member_id", (req, res) => {
  const member_id = req.params.member_id;

  let sql = "DELETE FROM members WHERE member_id = ?";
  sql = mysql.format(sql, [member_id]);

  conn.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Internal server error", error: err });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Member not found" });
    } else {
      res.status(200).json({ message: "Member deleted successfully" });
    }
  });
});