import express from 'express';
import mysql from 'mysql'; 
import { conn } from '../dbconn'; // ควรตรวจสอบว่ามีการเชื่อมต่อกับฐานข้อมูลที่ถูกต้อง

export const router = express.Router();


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

    // ฟังก์ชันที่ใช้สำหรับตรวจสอบการมีอยู่ของ rank
    const checkExistingRanks = (ranks: number[]): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT DISTINCT `rank` FROM lottodraws WHERE `rank` IN (?)';
            conn.query(sql, [ranks], (err, results: { rank: number }[]) => {
                if (err) {
                    return reject(err);
                }
                // Check if all ranks exist
                const existingRanks = results.map(row => row.rank);
                resolve(ranks.every(rank => existingRanks.includes(rank)));
            });
        });
    };

    try {
        // ตรวจสอบการมีอยู่ของ ranks
        const exists = await checkExistingRanks(ranks);

        if (exists) {
            return res.json({ message: 'Ranks 1-5 already exist. No new lotto numbers generated.' });
        }

        const drawDate = new Date(); // กำหนดวันที่และเวลาปัจจุบัน
        const status = 'pending'; // ตั้งค่า status เป็น 'pending'

        // วนลูปเพื่อสุ่มหมายเลข 5 ครั้ง
        for (let i = 0; i < ranks.length; i++) {
            const [randomNumber] = await getRandomNumbers(1); // สุ่มหมายเลข 1 หมายเลข
            const lottoNumber = randomNumber.lotto_number;

            // แทรกข้อมูลลงใน lottodraws
            const insertSql = `
                INSERT INTO lottodraws (draw_date, winning_numbers, status, \`rank\`)
                VALUES (?, ?, ?, ?)
            `;
            const insertValues = [drawDate, lottoNumber, status, ranks[i]];
            await new Promise((resolve, reject) => {
                conn.query(insertSql, insertValues, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        }

        res.json({ message: 'Lotto numbers generated and inserted successfully' });
    } catch (error) {
        console.error('Error generating lotto numbers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




