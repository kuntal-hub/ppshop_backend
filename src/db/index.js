import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

// Connect to MongoDB

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected || DB host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongoDB connection FAILD:"+error);
        process.exit(1);
    }
}

export default connectDB;