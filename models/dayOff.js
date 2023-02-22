const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

const daysOffSchema = new mongoose.Schema({
    
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'UserSchema', 
        require:true
    }, 
    startDay:{
        type:Date ,
        require:true
    },
    endDay:{
        type:Date , 
        require:true
    },
    type:{
        type:String,
        enum:['Paid','Unpaid','Sick'],
        required:true
    },
    
    decisionManager:{
        userIdMan: {type: mongoose.Schema.Types.ObjectId,ref:'UserSchema'}, 
        statusMan: {type: Boolean, default: null},
        justificationMan: {type: String , default: null}
        },

    decisionDirector: {
        userIdDir: { type: mongoose.Schema.Types.ObjectId, ref:'UserSchema'},
        statusDir: {type: Boolean, default: null},
        justificationDir: {type: String , default: null}
        },
    
    statusDecision: { 
        type: Boolean, 
        default:false
    },
    statusReq: {
        type: Boolean,
        default:false
    },
    reqDayOff : { 
        type: Number, 
        default: 0
    },
    JustificationSick : {
        type: String 
    }


   }

, {timestamps: { currentTime: () => Date.now() },versionKey: false }
);
daysOffSchema.plugin(uniqueValidator);
module.exports = mongoose.model('day_off',daysOffSchema) 