import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
const _dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const apiKey = "28bf7e1ee421f657a1219ef7441c8f34";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric";
app.use(express.static("public"));
app.use((bodyParser.urlencoded({extended:true})));
app.get("/",(req,res)=>{
    res.render("weather.ejs");
});
app.post("/submit",async (req,res)=>{
    try{
        const response = await axios.get(apiURL + `&q=${req.body["place"]}` + `&appid=${apiKey}`);
        console.log(response.data.weather[0].main);
        res.render("weather.ejs",{data: response.data});
    }catch(error){
        console.error("failed: ",error.message);
        res.status(500).send("Invalid city name");
    }
});
app.listen(3000,()=>{
    console.log("listening for port 3000");
});