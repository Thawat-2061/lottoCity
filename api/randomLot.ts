import express from 'express';
import mysql from 'mysql'; 
import { conn } from '../dbconn'; // ควรตรวจสอบว่ามีการเชื่อมต่อกับฐานข้อมูลที่ถูกต้อง

export const router = express.Router();

// เส้นสุ่ม รางวัล ที่ 1-5  15 ใบ
router.get('/randomlot', async (req, res) => {
    const ranks = [1, 2, 3, 4, 5]; // รางวัลที่ 1-5

    // ฟังก์ชันที่ใช้สำหรับสุ่มหมายเลข
    const getRandomNumbers = (limit: number): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT lotto_number FROM lottonumbers ORDER BY RAND() LIMIT ?';
            conn.query(sql, [limit], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    };

    // ฟังก์ชันที่ใช้สำหรับตรวจสอบจำนวนหมายเลขที่มีอยู่
    const checkNumberCount = (): Promise<number> => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) AS count FROM lottodraws';
            conn.query(sql, (err, results: { count: number }[]) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0].count);
            });
        });
    };

    // ฟังก์ชันที่ใช้สำหรับลบหมายเลขที่มีอยู่
    const deleteExistingNumbers = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM lottodraws';
            conn.query(sql, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };

    try {
        // ตรวจสอบจำนวนหมายเลขที่มีอยู่
        const existingNumberCount = await checkNumberCount();

        // ถ้ามีหมายเลขทั้งหมด 15 หมายเลขแล้ว ไม่ต้องสร้างหมายเลขใหม่
        if (existingNumberCount >= 15) {
            return res.json({ message: '15 lotto numbers already exist. No new lotto numbers generated.' });
        }

        // ลบหมายเลขที่มีอยู่ก่อนการสร้างหมายเลขใหม่
        await deleteExistingNumbers();

        const drawDate = new Date(); // กำหนดวันที่และเวลาปัจจุบัน
        const status = 'pending'; // ตั้งค่า status เป็น 'pending'

        // วนลูปเพื่อสุ่มหมายเลขตามลำดับของ rank
        for (let i = 0; i < ranks.length; i++) {
            const rank = ranks[i];
            const numberOfNumbers = rank; // จำนวนหมายเลขที่ต้องการสำหรับ rank นี้

            // สุ่มหมายเลขตามจำนวนที่ต้องการ
            const randomNumbers = await getRandomNumbers(numberOfNumbers);
            for (const randomNumber of randomNumbers) {
                const lottoNumber = randomNumber.lotto_number;

                // แทรกข้อมูลลงใน lottodraws
                const insertSql = `
                    INSERT INTO lottodraws (draw_date, winning_numbers, status, \`rank\`)
                    VALUES (?, ?, ?, ?)
                `;
                const insertValues = [drawDate, lottoNumber, status, rank];
                await new Promise<void>((resolve, reject) => {
                    conn.query(insertSql, insertValues, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            }
        }

        res.json({ message: 'Lotto numbers generated and inserted successfully' });
    } catch (error) {
        console.error('Error generating lotto numbers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// เส้นของ Admin ดึงข้อมูลหวยมาโชว์ทั้งหมด
router.get('/getwinNumber', async (req, res) => {
    try {
        // คำสั่ง SQL สำหรับดึงข้อมูล winning_numbers โดยเรียงลำดับตาม rank จากน้อยไปมาก
        const sql = 'SELECT winning_numbers ,status FROM lottodraws ORDER BY `rank` ASC';
        
        conn.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching winning numbers:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            // ส่งผลลัพธ์กลับไปในรูปแบบ JSON
            res.json(results);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// เส้น User ดึงข้อมูล หวยที่ถูกประกาศรางวัลมา โชว์ หน้า checklot
router.get('/getUserCheckLot', async (req, res) => {
    
        // SQL query to fetch winning numbers, draw date, and rank where status is 'completed'
        const sql = `
            SELECT *
            FROM lottodraws 
            WHERE status = 'pending'
            ORDER BY 'rank' ASC
        `;
        
        conn.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching winning numbers:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            // Send results back in JSON format
            res.json(results);
        });
   
});

// เส้น เช็ค จากหน้า chechlot ว่าได้รางวัลอะไรไหม
router.post('/checkLotwin', async (req, res) => {

    const { lotto_number } = req.body; // รับค่าหมายเลขล็อตเตอรี่จาก URL parameter

    if (!lotto_number) {
        return res.status(400).json({ error: 'Lotto number is required.' });
    }

    try {
        // SQL Query เพื่อตรวจสอบว่า lotto_number นั้นอยู่ใน winning_numbers และสถานะเป็น 'completed' หรือไม่
        const sql = `
            SELECT \`rank\`, status 
            FROM lottodraws 
            WHERE FIND_IN_SET(?, winning_numbers) > 0
        `;
        
        conn.query(sql, [lotto_number], (err, results) => {
            if (err) {
                console.error('Error checking lotto number:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                // ถ้าไม่มีข้อมูลที่ตรงกัน แสดงว่าไม่ถูกรางวัล
                return res.status(404).json({ message: 'No prize for this lotto number.' });
            }

            const result = results[0];

            if (result.status !== 'completed') {
                // ถ้าสถานะยังไม่เป็น 'completed' ให้รีเทิร์นว่า "ยังไม่ประกาศรางวัล"
                return res.status(200).json({ message: 'is Not Completed' });
            }

            // ถ้าถูกรางวัล และสถานะเป็น 'completed' ให้รีเทิร์นอันดับ (rank)
            res.status(200).json({ rank: result.rank });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// เส้น ขึ้นเงินรางวัล
router.post('/claim-prize', async (req, res) => {
    const { lotto_number, member_id } = req.body;

    if (!lotto_number || !member_id) {
        return res.status(400).json({ error: 'Both lotto_number and member_id are required.' });
    }

    try {
        // SQL Query to check if the lotto number is a winning number
        const checkSql = `
            SELECT \`rank\`, status
            FROM lottodraws
            WHERE FIND_IN_SET(?, winning_numbers) > 0
        `;

        conn.query(checkSql, [lotto_number], (err, results) => {
            if (err) {
                console.error('Error checking lotto number:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No prize for this lotto number.' });
            }

            const result = results[0];

            if (result.status !== 'completed') {
                return res.status(200).json({ message: 'ยังไม่ประกาศรางวัล' });
            }

            // Calculate prize amount based on the rank
            let prizeAmount = 0;
            switch (result.rank) {
                case 1:
                    prizeAmount = 6000000;
                    break;
                case 2:
                    prizeAmount = 200000;
                    break;
                case 3:
                    prizeAmount = 80000;
                    break;
                case 4:
                    prizeAmount = 40000;
                    break;
                case 5:
                    prizeAmount = 20000;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid rank.' });
            }

            // Get a connection from the pool
            conn.getConnection((err, connection) => {
                if (err) {
                    console.error('Error getting connection from pool:', err);
                    return res.status(500).json({ error: 'Failed to get a connection from the pool.' });
                }

                connection.beginTransaction(async (transactionErr) => {
                    if (transactionErr) {
                        console.error('Failed to start transaction:', transactionErr);
                        connection.release();
                        return res.status(500).json({ error: 'Failed to start transaction.' });
                    }

                    try {
                        // Update wallet_amount in members
                        const updateWalletSql = 'UPDATE members SET wallet_balance = wallet_balance + ? WHERE member_id = ?';
                        await new Promise<void>((resolve, reject) => {
                            connection.query(updateWalletSql, [prizeAmount, member_id], (updateWalletErr) => {
                                if (updateWalletErr) {
                                    return reject(updateWalletErr);
                                }
                                resolve();
                            });
                        });

                        // Delete the lotto number from lottodraws
                        const deleteSql = 'DELETE FROM lottonumbers WHERE FIND_IN_SET(?, winning_number) > 0';
                        await new Promise<void>((resolve, reject) => {
                            connection.query(deleteSql, [lotto_number], (deleteErr) => {
                                if (deleteErr) {
                                    return reject(deleteErr);
                                }
                                resolve();
                            });
                        });

                        // Commit transaction
                        connection.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Failed to commit transaction:', commitErr);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: 'Failed to commit transaction.' });
                                });
                            }

                            connection.release();
                            res.status(200).json({
                                message: `Prize of ${prizeAmount} has been added to the wallet.`,
                            });
                        });
                    } catch (error) {
                        console.error('Error during transaction:', error);
                        connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Internal Server Error' });
                        });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/toggle-status', (req, res) => {
    const { status } = req.body;

    if (status !== 'pending' && status !== 'completed') {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    // ตั้งค่าหมายเลขสถานะที่ต้องการเปลี่ยนเป็นอีกสถานะหนึ่ง
    const newStatus = status === 'pending' ? 'completed' : 'pending';

    const sql = `
        UPDATE lottodraws
        SET status = ?
    `;

    conn.query(sql, [newStatus], (err, results) => {
        if (err) {
            console.error('Error toggling statuses:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({
            message: `Status updated to ${newStatus} for ${results.affectedRows} records.`
        });
    });
});
