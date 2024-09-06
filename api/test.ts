import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ตรวจสอบให้แน่ใจว่าไฟล์นี้มีการเชื่อมต่อฐานข้อมูลอย่างถูกต้อง

export const router = express.Router();

// เส้น TEST สร้าง user

// ตัวอย่างเทสใน POSTMAN
// {
//     "username": "john_doe",
//     "password": "securepassword123",
//     "email": "john.doe@example.com",
//     "type": "user"
// }

router.post('/', (req, res) => {
  const { username, password, email, type } = req.body;
  const wallet_balance = 0.00; // ค่าเริ่มต้นของ wallet_balance

  // ตรวจสอบว่า username และ email มีอยู่แล้วในฐานข้อมูลหรือไม่
  const checkQuery = 'SELECT * FROM members WHERE username = ? OR email = ?';
  conn.query(checkQuery, [username, email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // เพิ่มสมาชิกใหม่
    const query = 'INSERT INTO members (username, password, email, wallet_balance, type) VALUES (?, ?, ?, ?, ?)';
    conn.query(query, [username, password, email, wallet_balance, type], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database insertion error' });
      }
      res.status(201).json({ message: 'Member added successfully', memberId: result.insertId });
    });
  });
});

// ใช้ export default เพื่อให้แน่ใจว่า module ถูกส่งออกมาอย่างถูกต้อง
export default router;
