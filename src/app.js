import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/errorHandeler.middleware.js";

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

import customerInfoRouter from "./routes/customerInfo.router.js";
import entryRouter from "./routes/entry.router.js";
import reportRouter from "./routes/report.router.js";
import balanceRouter from "./routes/balance.router.js";
import accountRouter from "./routes/account.router.js";
import userRouter from "./routes/user.router.js";

// use routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/customerInfo", customerInfoRouter);
app.use("/api/v1/entry", entryRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/balance", balanceRouter);
app.use("/api/v1/account", accountRouter);

app.use(errorHandler)

export default app;