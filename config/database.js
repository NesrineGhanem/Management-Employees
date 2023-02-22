const mongoose = require('mongoose')
const URL_compass ='mongodb://localhost:27017/employees'
mongoose.set('strictQuery', false);
const connectBD =()=>{
    mongoose.connect (URL_compass).then (
         ()=>{console.log('success connection mongoDB')}
    ).catch(
    console.log('error connection to mongoDB')
    )}
module.exports =connectBD;