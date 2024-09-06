import  express  from "express";
import { conn } from "../dbconn";
import mysql from 'mysql';
import {StarsGetResponse} from "../model/model";




export const router = express.Router();



router.get("/",(req,res)=>{
    let sql = "select * from stars"
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
    const movie : StarsGetResponse = req.body;
    let sql = "INSERT INTO `stars`( `movieId`, `personId`, `role`) VALUES (?,?,?)";

    sql = mysql.format(sql,[
        movie.movieId,
        movie.personId,
        movie.role,
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
    let sql = "DELETE FROM `stars` WHERE starId = ?"

    conn.query(sql,[id],(err,result)=>{
        if (err) throw err;
        res
          .status(201)
          .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});