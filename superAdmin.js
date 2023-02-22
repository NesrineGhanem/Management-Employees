
const connectBD = require("./config/database");
const UserSchema = require('./models/user');
const bcrypt = require('bcryptjs');
const{sendConfirmation} = require('../backend/middleware/nodemailer')
const data = require ('./super_admin.json')

connectBD()
console.log(data)

const chara  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh'
let generatedPassword = '';
var charactersLengths = chara.length;
for ( let i = 0; i < 5; i++ ) {
generatedPassword += chara.charAt(Math.floor(Math.random() * charactersLengths));
}

const plainPassword=generatedPassword;
console.log(plainPassword)

const query = UserSchema.findOne ({'role':'Super Admin'});
query.select('role');

query.exec((err,res)=>{
if(err) res.status(500).json({err});
    else{
    if(res){
        console.log('Super admin is already exist');
        return process.exit();
    }else{
        bcrypt.hash(plainPassword, 10)
        .then(hashedPassword => {
        let user = new UserSchema({...data,password: hashedPassword});

    
                 
    user.isActive= true
    user.save()
    sendConfirmation(user.email,plainPassword)
    console.log('super admin is created')
    })
    .catch((err) => console.log(err))

    }
    }
}
) 


          


