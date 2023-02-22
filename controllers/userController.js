const UserSchema = require('../models/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendConfirmation,sendForgetPassword} = require('../middleware/nodemailer');
const dayjs = require("dayjs");

//add user
const addUser =  (req, res, next) => { 
   //confirmation password
  const chara  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh'
  let generatedPassword = '';
  var charactersLengths = chara.length;
  for ( let i = 0; i < 5; i++ ) {
  generatedPassword += chara.charAt(Math.floor(Math.random() * charactersLengths));
  }

  const plainPassword = generatedPassword
  bcrypt.hash(plainPassword, 10)
        .then(hash => {
         let user = new UserSchema({
         firstName: req.body. firstName,
         LastName: req.body.LastName,
         email: req.body.email,
         password: hash,
         role: req.body.role, 
         building: req.body.building,
         phone: req.body.phone,
         avatar: req.body.avatar,
        })
        
        user.save()
            .then(() => {
             res.status(201).json({ message: 'User created ' })
  
             //confirmation password
             sendConfirmation( user.email, plainPassword)
                  })
              .catch(error =>
              res.status(400).json({ error }));
              })
              .catch(error =>
              res.status(500).json({ error })); 
  }
  
//login  
const Login  = (req, res, next) => {
      UserSchema.findOne({ email: req.body.email }) 
      .then(user => { 
          if (!user) { 
              return res.status(404).json({ error: 'User not found !' }); 
          } 
          if(user.isActive === false) {
              return res.status(401).json({ error: "You can't login ! You are disabled ! "}); 
          }
         bcrypt.compare(req.body.password, user.password) 
          .then(reslt => { 
              if (!reslt) { 
                 return res.status(401).json({  error: 'Incorrect password !'});    
              }
              let debutContrat = user.createdAt
              let localDate = dayjs(new Date())
              let diifNowDebut = localDate.diff(debutContrat, 'months')
              let newSoldDays = 2 * diifNowDebut
              user.soldeDays = newSoldDays
              user.save()
              res.status(200).json({ 
                  userId: user._id, 
                  token: jwt.sign(
                { userId: user._id,role:user.role },
       'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
                        ) ,
                  RefreshToken: jwt.sign(
                { userId: user._id,role:user.role },
       'RANDOM_TOKEN_SECRET',
                { expiresIn: '27h' }
                    )
              });  
              if(user.allDaysOff === 24) {
                  console.log("you have finished your leave balance !")
                  
              }     
          }) 
          .catch(error => res.status(400).json({ error }));       
      })
      .catch(error => res.status(500).json({ error }));   
  }
  
 
//forget password
const forgetPassword= async(req,res)=>{
const {email}= req.body;
try{
  const oldUser = await UserSchema.findOne({email})
  if(!oldUser){
    return res.send("user not exist")
  }
  const secret = 'RANDOM_TOKEN_SECRET'+ oldUser.password
  const token =jwt.sign(
              { email: oldUser.email,id:oldUser._id },
                secret,
              { expiresIn: '24h' });
     
sendForgetPassword(oldUser.email,oldUser._id,token) 
res.status(200).json({message:'please check your email for reset your password'})   
}catch(error){
res.status(500).json({error});    
}}
 

//reset password

 const resetPassword = async (req, res) => {
  const {password, token} = req.body;
  try {
  const decodedToken = jwt.decode(token)
  console.log("decoded" , decodedToken)
  const userId = decodedToken.id
  console.log('user is:', userId);
  const oldUser = await UserSchema.findOne({_id: userId})
  console.log('user id is :',oldUser)
  if(!oldUser) {
      return res.status(404).json({error: 'User not found'})
  }
  
      const encryptedPassword = await bcrypt.hash(password, 10)
      await UserSchema.updateOne(
          {_id: userId},
          {$set : {
              password: encryptedPassword
              }
          }
      )
       
     
      res.status(200).json({message: "password updated"} )
  } catch (error) {
      res.status(500).json({message: "somthing went wrong!"})
      }
}


// Define a route to fetch all users
 const getList = async (req, res) => {
  let { page, limit, sortBy,createdAt, createdAtBefore, createdAtAfter } = req.query
  if(!page) page=1
  if(!limit) limit=30

  const skip=(page-1)*limit
 const users= await UserSchema.find()
                        .sort({ [sortBy]: createdAt })
                        .skip(skip)
                        .limit(limit)
                        .where('createdAt').lt(createdAtBefore).gt(createdAtAfter)
                        .select("-password")
const count= await UserSchema.count() //estimatedDocumentCount() or countDocuments()
                        
 res.send({page:page,limit:limit,totalItems:count,users:users})
}

 // get one user 
const getUserById= async (req,res)=>{
  try{
      await UserSchema.find({_id:req.params.id})
     .select("-password")
     .then(result=>{
  res.send(result)
     })
     }
     catch(err){
         console.log(err)
 }; } ;

// update
const updateInformation =async (req, res) => { 
  try{ 
   const token = req.headers.authorization.split(' ')[1]; 
   const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
   console.log(decodedToken.role)
   
        if(decodedToken.role !== "super admin"){
        const user= await UserSchema.findByIdAndUpdate(req.params.id,{
           firstName : req.body.firstName,
           LastName : req.body.LastName,
           phone : req.body.phone 
        }) 
       await user.save();
       res.status(200).send(user);
       }
       else {
           const user= await UserSchema.findByIdAndUpdate(req.params.id, req.body)
           await user.save();
           res.status(200).send(user);
       }
   }
   catch (err) {    
   res.status(404).send(err)
   }
   
}

//delete
const deleteUser= (req, res, next) => {
  UserSchema.deleteOne({_id: req.params.id}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
}

//disable
const disable =async (req,res,next)=>{
    users = await UserSchema.findByIdAndUpdate(
      { _id: req.params.id },
      { isActive: req.body.isActive} ,
      )
     
   .then(users=>{
if( users){
users.isActive = false 
   users.save()
   res.send({ message: "User account is deactivate ! ",})
     }
})
.catch(error=>res.status(500).json({error:'code incorrect'}))
}

module.exports = {addUser,Login,forgetPassword,resetPassword,getList,getUserById,updateInformation,deleteUser,disable}