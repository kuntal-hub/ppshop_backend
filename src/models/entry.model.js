import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const entrySchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"CustomerInfo",
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    from:{
        type:String,
        default:"cash",
    },
    remarks:{
        type:String,
        default:"",
    },
    ob:{
        type:Number,
    }
},{timestamps: true});

entrySchema.plugin(mongooseAggregatePaginate);

export const Entry = mongoose.model('Entry',entrySchema);