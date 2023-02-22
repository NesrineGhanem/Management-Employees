const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    email: { type: String,
        required: true,
        unique: true
    },

    role: {
        type: String, 
        default:' Software Engineer', 
        enum:['Director', 'Administration Director','Administration Assistant',
        'Team manager', 'Software Engineer','Super Admin']
    },

    password:{ type: String,
        required: true
    },

    building: {
        type: String, 
        enum:['Front-End', 'Back-End','Full-Stack','Super-Admin'] ,
        required:true
        },
    
    phone: {
        type: String, 
        required:true
        },
    avatar: {
        type: String, 
        required:false
    },
    isActive : {
        type: Boolean, 
        default:true
    },
    soldeDays : { 
        type: Number, 
        default: process.env.soldeDaysByMonth
    },
    allDaysOff : { 
        type: Number, 
        default: 0
    },
    daysOffSick : { 
        type: Number, 
        default: 0
    }
  
    
},{timestamps:true,versionKey:false})
UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('users',UserSchema)    