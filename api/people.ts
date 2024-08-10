import  express  from "express";
import { conn } from "../dbconn";
import mysql from 'mysql';
import {PeopleGetResponse} from "../model/model";




export const router = express.Router();




router.get("/",(req,res)=>{
    let sql = "select * from people"
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
    const people : PeopleGetResponse = req.body;
    let sql = "INSERT INTO `people`(`name`, `birthdate`, `biography`) VALUES (?,?,?)"

    sql = mysql.format(sql,[
        people.name,
        people.birthdate,
        people.biography,


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
    let sql = "DELETE FROM `people` WHERE personId = ?"

    conn.query(sql,[id],(err,result)=>{
        if (err) throw err;
        res
          .status(201)
          .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});