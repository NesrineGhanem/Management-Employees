const jwt = require('jsonwebtoken');

//authorization roles 
exports.checkRole=(roles,req,res,next)=> {
   console.log(roles,req)
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    if (roles.includes(decodedToken.role))
        next()
    else
    return res.status(403).json({error:"you don't have access"})}