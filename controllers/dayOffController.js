
const daysOffSchema = require('../models/dayOff');
const UserSchema = require('../models/user');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs')


//add dayoff
exports.addDaysOff=async(req,res)=>{
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
    const userId = decodedToken.userId
    try{
       
        let newDaysOff = new daysOffSchema({
            userId:userId,
            startDay:req.body.startDay,
            endDay:req.body.endDay,
            type:req.body.type,
            JustificationSick: req.body.JustificationSick
        }); 
        let startDay = dayjs(newDaysOff.startDay)
        let endDay = dayjs(newDaysOff.endDay)
        let reqDay = endDay.diff(startDay, 'days')
        if(reqDay > process.env.maxDaysByMonth) {
            return res.status(201).send({ message : "maximum 10 days"})
        }
        newDaysOff.reqDayOff = reqDay
        await newDaysOff.save();
        return res.status(200).send({ message: `your request is succussffully added and the id of it ${newDaysOff._id} ` });
    }
    catch (err) {
        res.status(400).send({ error: `error adding new Days Off ${err}` })
        }
};


//get info all request day off
exports.getDaysOff = async(req,res)=>{
    let { page, limit, sortBy,createdAt, createdAtBefore, createdAtAfter } = req.query
    if(!page) page=1
    if(!limit) limit=30

    const skip=(page-1)*limit
    const daysOffList= await daysOffSchema.find()
                        .sort({ [sortBy]: createdAt })
                        .skip(skip)
                        .limit(limit)
                        .where('createdAt').lt(createdAtBefore).gt(createdAtAfter)
    const count= await daysOffSchema.count() //estimatedDocumentCount() or countDocuments()
                        
  res.send({page:page,limit:limit,totalItems:count,daysOffList:daysOffList})
   
   } ;

//get info one request day off
exports.getDaysOffId=async(req,res)=>{
    try{
        await daysOffSchema.findById({_id: req.params.id})
        .then(result=>{
            res.send(result)
        })
    }
   
    catch(err){
        res.send(err)
    }
};


// update request day off
exports.updateDaysOff=async (req, res) => {
    if(!req.body){
        return res.status(400).send({message:`Day off can not update, be empty!`})
    }
    const {id} = req.params;
    daysOffSchema.findOne({_id: id})
    .then(dayoff => {
        if(!dayoff){ 
            return res.status(401).json({ error: 'Request not found !' }); } 

        if(dayoff.statusDecision === true){
            res.status(401).json({error:`you can't update this request`})}    
        });

    try {
            const daysOffs = await daysOffSchema.findByIdAndUpdate(req.params.id,req.body );   
            let startDay = dayjs(daysOffs.startDay)
            let endDay = dayjs(daysOffs.endDay)
            let reqDay = endDay.diff(startDay, 'days')
            if(reqDay > process.env.maxDaysByMonth) {
                return res.status(201).send({ message : "maximum 10 days"})
            }
            daysOffs.reqDayOff = reqDay
            await daysOffs.save()
            res.status(200).send({ message: `${daysOffs.id} is succussffully updated` });
         }
    catch (error) {
        res.status(500).json({err:`err`}); 
    }
    
}

//delete request day off
  exports.deleteDayOff=async(req,res)=>{
    const{id} = req.params;
    try{
    const dayoff = await daysOffSchema.findOne({_id:id})
    if(!dayoff){
        return res.status(401).json({error:`Request not found or you are disabled now! `})
    }
    if(dayoff.statusDecision === true){
        return res.status(401).json({error:`you can not remove this request!`})
    }
    const dayoffDel = await daysOffSchema.findOneAndDelete({_id:req.params.id})
    res.status(200).send({message:`${dayoffDel.id} is succussffully deleted`})
    }
    catch(err){
        res.json({message:`error deleting!`})
    }
  };


//decision manager || directer
exports.daysOffDecision = async (req, res, next) => {
    const { id } = req.params
    const idReq = await daysOffSchema.findOne({_id: id})
    if(!idReq) {
        return res.json({error: 'Request not found'})
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; 
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
        console.log(decodedToken.role)
        const userId = decodedToken.userId; 
        if(decodedToken.role === "Team manager"){
            await daysOffSchema.findByIdAndUpdate(
                {_id: id},
                {$set : {
                    "decisionManager .userIdMan": userId,
                    "decisionManager.statusMan": req.body.statusMan,
                    "decisionManager.justificationMan": req.body.justificationMan 

                }}    
            )}
        if(decodedToken.role === "Director"){
            await daysOffSchema.findByIdAndUpdate(
                {_id: id},
                {$set : {
                    "decisionDirector.userIdDir": userId,
                    "decisionDirector.statusDir": req.body.statusDir,
                    "decisionDirector.justificationDir": req.body.justificationDir
                    }}
                )}

        await daysOffSchema.findByIdAndUpdate(
            {_id:id},
            {$set :{"statusDecision":true}}
         )
        
         
         
        res.status(200).send(`user with id = ${userId} ,your answer is succussffully send`);
        next()
    }catch (err) {
        res.status(400).send( `error adding new Days Off ${err}` )
    }
    }
    //the status of request Accepted or Declined
exports. statusReq = async ( req, res) => {
    const { id } = req.params
    const idReq = await daysOff.findOne({_id: id})
    const idUser = idReq.userId
    let user = await User.findOne({_id: idUser})
    let oldSoldDays = user.soldeDays
    let statusMan = idReq.decisionManager.Status
    let statusDir = idReq.decisionDirector.Status
    let reqDays = idReq.reqDayOff
    let oldSoldSick = user.daysOffSick
    if(statusDir && statusMan === true){
        await daysOff.findByIdAndUpdate(
            {_id: id}, 
            {$set : {
                "statusReq" : true
            }}
        )
        if(idReq.JustificationSick != null && user.daysOffSick < process.env.soldDaysOffSick) {
            await daysOff.findByIdAndUpdate(
                {_id: id}, 
                {$set : {
                    "type" : `Sick`
                }}
            )
            await User.findByIdAndUpdate( 
                {_id: idUser},
                {$set : {
                    "daysOffSick" : oldSoldSick + reqDays 
                    
                    }
                }
            )
        }
        let allDaysOff = user.allDaysOff + reqDays
        if(allDaysOff > process.env.soldDaysByYear) {
            await daysOff.findByIdAndUpdate(
                {_id: id}, 
                {$set : {
                    "type" : `Unpaid`
                    }
                }
            )
        }
        let newSoldDays = oldSoldDays - reqDays
        await User.findByIdAndUpdate( 
            {_id: idUser},
            {$set : {
                "soldeDays" : newSoldDays
                }
            }
        )
        if(idReq.type != 'Sick')
        await User.findByIdAndUpdate( 
            {_id: idUser},
            {$set : {
                "allDaysOff": allDaysOff
                }
            }
        )
    }  
}

   


    















