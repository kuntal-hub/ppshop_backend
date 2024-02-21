import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reportSchema = new Schema({
    entry:{
        type:Schema.Types.ObjectId,
        ref:"Entry",
        required:true,
    },
    total:{ // total amount of money
        type:Number,
        default:0,
    },
    fiveh:{ // number of 500 rupees notes
        type:Number,
        default:0
    },
    twoh:{ // number of 200 rupees notes
        type:Number,
        default:0
    },
    oneh:{ // number of 100 rupees notes
        type:Number,
        default:0
    },
    fifty:{ // number of 50 rupees notes
        type:Number,
        default:0
    },
    twenty:{ // number of 20 rupees notes
        type:Number,
        default:0
    },
    ten:{ // number of 10 rupees notes
        type:Number,
        default:0
    },
    others:{ // amount of other rupees coins
        type:Number,
        default:0
    },
},{timestamps: true});

reportSchema.pre('save', function(next) {
    this.total = (this.fiveh*500) + (this.twoh*200) + (this.oneh*100) + (this.fifty*50) + (this.twenty*20) + (this.ten*10) + this.others;
    return next();
});

reportSchema.plugin(mongooseAggregatePaginate);

export const Report = mongoose.model('Report',reportSchema);