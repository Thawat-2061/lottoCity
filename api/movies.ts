import  express  from "express";
import { conn } from "../dbconn";
import mysql from 'mysql';
import {MovieGetResponse} from "../model/model";




export const router = express.Router();

router.get("/",(req,res)=>{
    let sql = "select * from movies"
    conn.query(sql,(err,result)=>{
        if(err){
            res.status(400).json(err);
        }else{
            res.json(result);
        }
    });
});

//Serch
router.get("/:title", (req, res) => {
    const title = "%" + req.params.title + "%";

    let query1 = "SELECT * FROM movies WHERE title LIKE ?";
    let query2 = "SELECT DISTINCT stars.role as stars_role, people.name as stars_name FROM stars JOIN people ON stars.personId = people.personId JOIN movies ON stars.movieId = movies.movieId WHERE movies.title LIKE ?";
    let query3 = "SELECT DISTINCT creators.role as creators_role, people.name as creators_name FROM creators JOIN people ON creators.personId = people.personId JOIN movies ON creators.movieId = movies.movieId WHERE movies.title LIKE ?";

    let results : any= {};

    conn.query(query1, [title], (err, result1) => {
        if (err) {
            console.error(err);
            return res.status(400).json(err);
        }
        results.movies = result1;

        conn.query(query2, [title], (err, result2) => {
            if (err) {
                console.error(err);
                return res.status(400).json(err);
            }
            results.stars = result2;

            conn.query(query3, [title], (err, result3) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json(err);
                }
                results.creators = result3;

                res.json(results);
            });
        });
    });
});

//add
router.post("/",(req,res)=>{
    const movie : MovieGetResponse = req.body;
    let sql = "INSERT INTO `movies`(`title`, `year`, `genre`, `director`, `plot`, `poster`, `rating`) VALUES (?,?,?,?,?,?,?)"

    sql = mysql.format(sql,[
        movie.title,
        movie.year,
        movie.genre,
        movie.director,
        movie.plot,
        movie.poster,
        movie.rating,

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
    let sql = "DELETE FROM `movies` WHERE movieId = ?"

    conn.query(sql,[id],(err,result)=>{
        if (err) throw err;
        res
          .status(201)
          .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
});