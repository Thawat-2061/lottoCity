import express from 'express';
import mysql from 'mysql';
import { conn } from '../dbconn'; // ควรตรวจสอบว่ามีการเชื่อมต่อกับฐานข้อมูลที่ถูกต้อง

export const router = express.Router();

router.get('/:member_id', async (req, res) => {
    try {
      // ดึง member_id จาก URL parameters
      const memberId = req.params.member_id;
  
      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required' }); // ตรวจสอบว่ามีการส่ง member_id หรือไม่
      }
  
      // สร้างคำสั่ง SQL เพื่อดึงข้อมูลทั้งหมดที่ตรงกับ member_id
      const sql = "SELECT * FROM lottonumbers WHERE member_id = ?";
  
      // ใช้ Promise เพื่อทำให้โค้ดอ่านง่ายขึ้น
      conn.query(sql, [memberId], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message }); // จัดการข้อผิดพลาดในการเชื่อมต่อหรือคำสั่ง SQL
        }
        if (result.length === 0) {
          return res.status(404).json({ message: 'No records found for the given Member ID' }); // ไม่มีข้อมูลที่ตรงกับ member_id
        }
        res.json(result); // ส่งผลลัพธ์เมื่อสำเร็จ
      });
    } catch (error: unknown) {
      const errorMessage = (error as Error).message; // แปลงประเภท error เป็น Error เพื่อดึง message ออกมา
      res.status(500).json({ error: 'An unexpected error occurred: ' + errorMessage }); // จัดการข้อผิดพลาดที่ไม่คาดคิด
    }
  });

router.get('/insertLotto', async (req, res) => {
    try {
      const values = new Set();
  
      // สร้างชุดตัวเลขสุ่มที่ไม่ซ้ำกัน
      while (values.size < 100) {
        const lottoNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // สร้างเลขสุ่ม 6 หลัก
        values.add(lottoNumber);
      }
  
      // เตรียมข้อมูลสำหรับการ INSERT
      const insertValues = Array.from(values).map(lottoNumber => [null, lottoNumber, new Date(), 80]);
  
      const sql = "INSERT INTO lottonumbers (member_id, lotto_number, purchase_date, amount) VALUES ?";
  
      // ใช้ Promise เพื่อทำให้โค้ดอ่านง่ายขึ้น
      conn.query(sql, [insertValues], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message }); // จัดการข้อผิดพลาดในการเชื่อมต่อหรือคำสั่ง SQL
        }
        res.json({ message: 'Generated 100 unique lotto numbers successfully', result });
      });
    } catch (error: unknown) {
      const errorMessage = (error as Error).message; // แปลงประเภท error เป็น Error เพื่อดึง message ออกมา
      res.status(500).json({ error: 'An unexpected error occurred: ' + errorMessage }); // จัดการข้อผิดพลาดที่ไม่คาดคิด
    }
  });
  router.get('/showforsellLotto', async (req, res) => {
    try {
      const sql = "SELECT * FROM lottonumbers WHERE member_id IS NULL"; // ใช้คำสั่ง SQL เพื่อเลือกข้อมูลที่ member_id เป็น NULL
  
      // ใช้ Promise เพื่อทำให้โค้ดอ่านง่ายขึ้น
      conn.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message }); // จัดการข้อผิดพลาดในการเชื่อมต่อหรือคำสั่ง SQL
        }
        res.json(result); // ส่งผลลัพธ์เมื่อสำเร็จ
      });
    } catch (error: unknown) {
      const errorMessage = (error as Error).message; // แปลงประเภท error เป็น Error เพื่อดึง message ออกมา
      res.status(500).json({ error: 'An unexpected error occurred: ' + errorMessage }); // จัดการข้อผิดพลาดที่ไม่คาดคิด
    }
  });

export default router; // แก้ไขการส่งออกให้เป็น ES6 module


