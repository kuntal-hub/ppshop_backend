import dotenv from "dotenv";
import connectDB from './db/index.js';
import app from "./app.js";

dotenv.config({ path: "./.env" });

// connect to database
connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.error("Error on express server:"+error);
        throw error;
    })

    app.listen(process.env.PORT||8080,()=>{
        console.log("Server is running on port no " + process.env.PORT||8080)
    })
})
.catch((err)=>{
    console.error("Error on connect Express:"+err);
    throw err;
})