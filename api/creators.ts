import  express  from "express";
import { conn } from "../dbconn";
import mysql from 'mysql';
import {CreatorsGetResponse} from "../model/model";




export const router = express.Router();



router.get("/",(req,res)=>{
    let sql = "select * from creators"
    conn.query(sql,(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    });
});


//add
router.post("/",(req,res)=>{
    const creator : CreatorsGetResponse = req.body;
    let sql = "INSERT INTO `creators`(`movieId`, `personId`, `role`) VALUES (?,?,?)"

    sql = mysql.format(sql,[
        creator.movieId,
        creator.personId,
        creator.role,


    ]);

    conn.query(sql,(err,result)=>{
        if (err) throw err;
        res
          .status(201)
          .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});

//delete
router.delete("/:id",(req,res)=>{
    const id = req.params.id;
    let sql = "DELETE FROM `creators` WHERE creatorId = ?"

    conn.query(sql,[id],(err,result)=>{
        if (err) throw err;
        res
          .status(201)
          .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});