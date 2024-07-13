import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import env from "dotenv";
import bcrypt from "bcrypt";

import pg from "pg";
env.config();
const db = new pg.Client({
    user: process.env.USER,
    host: "localhost",
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: 5432,
});
db.connect();

const saltround = 4;
const _dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const apiKey = process.env.API_KEY;
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
app.use(express.static("public"));
app.use((bodyParser.urlencoded({extended:true})));
app.get("/",(req,res)=>{
    res.sendFile(_dirname + "/public/home.html");
});
app.get("/login",(req,res)=>{
    res.render("login.ejs");
});
app.get("/register",(req,res)=>{
    res.render("register.ejs");
});
app.post("/login",async (req,res)=>{
    const email = await req.body.username;
    const password = await req.body.password;
    const check = await db.query("SELECT * FROM users WHERE email = $1",[email]);
    if(check.rows.length>0){
        bcrypt.compare(password,check.rows[0].password,(err,result)=>{
            if(err){
                console.log("error",err);
            }
            else{
                if(result){
                    res.render("weather.ejs");
                }
                else{
                    res.send("incorrect password");
                }
            }
        });
    }
    else{
        res.send("email not found");
    }
});
app.post("/register",async (req,res)=>{
    const email = req.body["username"];
    const password = req.body["password"];
    const check = await db.query("SELECT * FROM users WHERE email = $1",[email]);
    if(check.rows.length>0){
        res.send("email is already used");
    }else{
        bcrypt.hash(password,saltround,async (err,hash)=>{
            if(err){
                console.log("error");
            }
            else{
                const result = await db.query("INSERT INTO users (email,password) VALUES($1,$2)",[email,hash]);
            }
        })
    }
    res.render("login.ejs");
});
app.post("/submit",async (req,res)=>{
    try{
        const response = await axios.get(apiURL + `&q=${req.body["place"]}` + `&appid=${apiKey}`);
        res.render("weather.ejs",{data: response.data});
    }catch(error){
        console.error("failed: ",error.message);
        res.status(500).send("Invalid city name");
    }
});
app.listen(3000,()=>{
    console.log("listening for port 3000");
});