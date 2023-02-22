const express = require("express");
const connectBD = require("./config/database");
const userRouter = require('./routes/userRouter');
const daysoffRouter= require('./routes/dayOffRouter');
var bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const  swaggerDocument = require ('./swagger.json'); 

const app= express();
connectBD()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(userRouter);
app.use(daysoffRouter);

//create new port
const port = process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`)
})

