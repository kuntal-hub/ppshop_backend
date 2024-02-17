import mongoose from "mongoose";
import { Schema } from "mongoose";

const accountSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:"text",
        trim:true,
    },
    balance:{
        type:Number,
        default:0,
    },
},{timestamps: true});

export const Account = mongoose.model('Account',accountSchema);