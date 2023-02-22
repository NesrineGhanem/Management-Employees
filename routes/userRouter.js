const express =  require('express');
const userRouter = express.Router();
const UserSchema = require('../models/user');
const {addUser,Login,forgetPassword,resetPassword,getList,getUserById,updateInformation,disable, deleteUser} = 
require('../controllers/userController');
const isAuth = require('../middleware/authentication');
const {checkRole} = require('../middleware/role');
const {validatorId} = require ('../middleware/validatorId');
const {validateRequest} = require('../middleware/validatorReq')
 
//login
userRouter.post('/auth/login',Login)
//forget password
userRouter.post('/auth/forgetPassword',forgetPassword )

//reset password
userRouter.patch('/auth/requestResetPassword',resetPassword )

//added a new user
userRouter.post('/users',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next),validateRequest,addUser)

//inf all user
userRouter.get('/users',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next),getList)

//inf user
userRouter.get('/userById/:id',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next),validatorId,getUserById)

//Update request (all user)
userRouter.put('/users/:id', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team manager', 'Software Engineer'], req, res, next),validatorId, updateInformation);

//delete
userRouter.delete('/users/delete/:id',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next),validatorId,deleteUser);

//Disable User
userRouter.patch( '/users/disable/:id',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next), validatorId,disable );

module.exports= userRouter;