const mongoose = require('mongoose');
const slugify = require('slugify');
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const validator = require('validator');
const { reset } = require('nodemon');

const user = new mongoose.Schema({
    name:{
        type:String,
        require:[true,'please enter your name'],
        maxlength:[30,'name must be less than or equal 30'],
        minlength:[10,'name must be greater than or equal 10'],
        validate: [validator.isAlpha,'A tour name must be only characters'],
        trim:true,
    },
    slug:String,
    email:{
        type:String,
        require:[true,'please enter your name'],
        unique:true,  
        lowercase: true, 
        validate:[validator.isEmail,'please pr']    
    },
    password:{
        type:String,
        required:[true ,'please enter your password'],
        minlength:[8,'password must be greater than or equal 8'],
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true ,'please confirm your password'],
        minlength:[8,'confirm password must be greater than or equal 8'],
        validate :{
            //this only work on create and save
            validator:function(el){
                return el === this.password
            },
            message:"passwords are not the same"
        }
    },
    passwordChangeAt: Date,
    passwordResetToken:String,
    passwordResetOtp:String,
    passwordResetExpires:Date,
    passwordResetVerified: Boolean,
    photo: String,
    phone:String,
    role:{
        type:String,
        enum:['user','admin','worker'],
        default:'user'
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})
// All methode pre don't work when update 
user.pre('save',function(next){
    // act on the currently processed document
    this.slug = slugify( this.name,{lower:true})
    next()
}) 
user.pre('save', async function(next){
    if(! this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,12)
    this.passwordConfirm = undefined;
    next()
})
user.pre(/^find/,function(next){
    // act on the currently processing query
    this.find({active :{$ne: false}}) 
    next()
}) 
user.methods.correctPassword = async function(candidatePass, userPass){ 
    return await bcrypt.compare(candidatePass, userPass)
}
user.methods.PasswordChangAfter = async function(JWTTimestamp){ 
    //if this exist in doc (take value) then pass is changed
    if(this.passwordChangeAt){
        // convert date formula to milliseconds as JWTTimestamp(iat)
        const changedTimestamp =  parseInt(this.passwordChangeAt.getTime()/1000,10) 
        console.log(changedTimestamp,JWTTimestamp)
        // pass change after take token (100 < 200)
        return JWTTimestamp < changedTimestamp
    }
    return false
}
user.methods.createPasswordResetOtp = function(){
    const resetToken = Math.floor(100000 + Math.random()*900000).toString()
    console.log({resetToken})
    this.passwordResetOtp = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log(this.passwordResetOtp)
    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken
}
user.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(6).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken
}
const User = mongoose.model('User',user)
module.exports = User