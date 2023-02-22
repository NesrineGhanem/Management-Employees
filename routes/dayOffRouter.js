
const express =  require('express');
const daysOffSchema = require('../models/dayOff');
const daysoffRouter= express.Router();
const {addDaysOff,getDaysOff,getDaysOffId,daysOffDecision, updateDaysOff, deleteDayOff} = require('../controllers/dayOffController');
const isAuth = require('../middleware/authentication');
const {checkRole} = require('../middleware/role');
const {validatorId} = require ('../middleware/validatorId');
const {validateDayoff} = require ('../middleware/validatorReq')

// add daysOff
daysoffRouter.post('/dayoff', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next),validateDayoff,addDaysOff);


// info all dayoff
daysoffRouter.get('/dayoff', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next) , getDaysOff );


// inf for one dayoff
daysoffRouter.get('/dayoff/:id', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next),validatorId, getDaysOffId );

//Update request (all user)
daysoffRouter.put('/dayoff/:id', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next),validatorId,updateDaysOff)

//delete 
daysoffRouter.delete('/dayoff/delete/:id', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next),validatorId,deleteDayOff);

//decision
daysoffRouter.patch('/dayoff/decision/:id', isAuth,(req, res, next)=> 
checkRole(['Director','Team manager'], req, res, next),validatorId,daysOffDecision)





module.exports= daysoffRouter;