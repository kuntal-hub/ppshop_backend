import mongoose from "mongoose";
import { Schema } from "mongoose";

const accountSchema = new Schema({
    name:{
        type:String,
        required:true,
        index:true,
        trim:true,
        unique:true,
    },
    balance:{
        type:Number,
        default:0,
    },
},{timestamps: true});

export const Account = mongoose.model('Account',accountSchema);