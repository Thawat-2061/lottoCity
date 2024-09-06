import  express  from "express";
import bodyParser from "body-parser";
import { router as test } from "./api/test";
import { router as login } from "./api/login";
export const app = express();


const cors = require('cors');
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

// app.use("/",(req,res)=>{
//     res.send("Hello World!")
// });

app.use("/test", test);

app.use("/login", login);



