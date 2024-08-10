import  express  from "express";
import { router as people } from "./api/people";
import bodyParser from "body-parser";
import { router as movie } from "./api/movies";
import { router as  stars} from "./api/stars";
import { router as creators } from "./api/creators";

export const app = express();


const cors = require('cors');
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use("/people",people);
app.use("/movie",movie);
app.use("/stars",stars);
app.use("/creators",creators);





app.use("/",(req,res)=>{
    res.send("Hello World!")
});



