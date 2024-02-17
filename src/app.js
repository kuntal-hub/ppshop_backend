import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    optionsSuccessStatus:200,
    credentials:true
}))
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true,limit:"5mb"}));
app.use(cookieParser());
app.use(express.static("public"));

// import all routes


export default app;