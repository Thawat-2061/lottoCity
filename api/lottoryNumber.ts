import express from 'express';
import mysql from 'mysql'; 
import { conn } from '../dbconn'; // ควรตรวจสอบว่ามีการเชื่อมต่อกับฐานข้อมูลที่ถูกต้อง

export const router = express.Router();

// ดึงข้อมูล หวย จาก ID ที่ส่งมา
router.get('/getLottoUser', async (req, res) => {
    try {
      // ดึง member_id จาก URL parameters
   
      const {member_id } = req.body; 
      
  
      if (!member_id) {
        return res.status(400).json({ error: 'Member ID is required' }); // ตรวจสอบว่ามีการส่ง member_id หรือไม่
      }
  
      // สร้างคำสั่ง SQL เพื่อดึงข้อมูลทั้งหมดที่ตรงกับ member_id
      const sql = "SELECT * FROM lottonumbers WHERE member_id = ?";
  
      // ใช้ Promise เพื่อทำให้โค้ดอ่านง่ายขึ้น
      conn.query(sql, [member_id], (err, result) => {
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


// สร้าง หวย 100 ใบ แบบสุ่มเลขไม่ซ้ำ ลงใน DB
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

  // ดึงข้อมูล หวย ที่ยังไม่ได้ถูกซื้อ คือ ไม่มี id คนซื้อติดอยู่ มาแสดงหน้าหลัก
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


  // ซื้อ หวย เมื่อถูกซื้อ โดยเอา id ของ User มาใส่ใน หวย จ่ายเงินด้วย เงินถูกหัก ถ้าเงินไม่พอซื้อไม่ได้
  router.put('/updateLottoMember', async (req, res) => {
    const { lotto_number, member_id, wallet_balance } = req.body;
  
    if (!lotto_number || !member_id || wallet_balance === undefined) {
      return res.status(400).json({ error: 'lotto_number, member_id, and wallet_balance are required.' });
    }
  
    try {
      conn.getConnection((err, connection) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to get a connection from the pool.' });
        }
  
        connection.beginTransaction(async (transactionErr) => {
          if (transactionErr) {
            connection.release();
            return res.status(500).json({ error: 'Failed to start transaction.' });
          }
  
          try {
            // Select the lotto_number_id and amount for the provided lotto_number
            const selectSql = "SELECT lotto_number_id, amount, member_id FROM lottonumbers WHERE lotto_number = ?";
            connection.query(selectSql, [lotto_number], (selectErr, rows) => {
              if (selectErr) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: 'Failed to query lottonumbers.' });
                });
              }
  
              if (rows.length === 0) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(404).json({ message: 'lotto_number not found.' });
                });
              }
  
              const row = rows[0];
  
              if (row.member_id !== null) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(400).json({ message: `Cannot update: lotto_number_id ${row.lotto_number_id} already has a member_id set.` });
                });
              }
  
              // Check if wallet_balance is sufficient for the purchase
              if (wallet_balance < row.amount) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(400).json({ message: 'Insufficient balance' });
                });
              }
  
              // Calculate the remaining balance
              const remainingBalance = wallet_balance - row.amount;
  
              // Update lottonumbers for the corresponding ID
              const updateLottoSql = "UPDATE lottonumbers SET member_id = ? WHERE lotto_number_id = ? AND member_id IS NULL";
              connection.query(updateLottoSql, [member_id, row.lotto_number_id], (updateLottoErr, updateLottoResult) => {
                if (updateLottoErr) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: 'Failed to update lottonumbers.' });
                  });
                }
  
                // Check if the row was updated
                if (updateLottoResult.affectedRows === 0) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(400).json({ message: 'Update failed: member_id was not NULL' });
                  });
                }
  
                // Update the members table with the remaining balance
                const updateMemberSql = "UPDATE members SET wallet_balance = ? WHERE member_id = ?";
                connection.query(updateMemberSql, [remainingBalance, member_id], (updateMemberErr) => {
                  if (updateMemberErr) {
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: 'Failed to update members.' });
                    });
                  }
  
                  // Retrieve the updated wallet balance from the database
                  const getBalanceSql = "SELECT wallet_balance FROM members WHERE member_id = ?";
                  connection.query(getBalanceSql, [member_id], (getBalanceErr, balanceRows) => {
                    if (getBalanceErr) {
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: 'Failed to retrieve updated balance.' });
                      });
                    }
  
                    // Commit transaction
                    connection.commit((commitErr) => {
                      if (commitErr) {
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({ error: 'Failed to commit transaction.' });
                        });
                      }
  
                      connection.release();
                      // Send the updated wallet balance as a plain number
                      const updatedBalance = balanceRows[0].wallet_balance.toString();
                      res.status(200).send(`${updatedBalance}`);
                    });
                  });
                });
              });
            });
          } catch (error) {
            connection.rollback(() => {
              connection.release();
              const errorMessage = (error as Error).message;
              res.status(500).json({
                message: 'Internal server error',
                error: errorMessage,
              });
            });
          }
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: (error as Error).message,
      });
    }
  });
  
  
  

  
  
  
  
export default router; // แก้ไขการส่งออกให้เป็น ES6 module


