const nodemailer=require('nodemailer');
const _=require('lodash');
const jwt=require('jsonwebtoken');
const User=require('../models/auth');
const { users } = require('../routes/auth');
var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "2b9594a958bec8",
      pass: "0131ba0836804e"
    }
  });

exports.signUp=(req,res)=>{
    const {name,email,password}=req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err){
            return res.status(401).json({
                error:'Something went wrong'
            })
        }
        if(user){
            return res.status(400).json({
                error:'Email already exist'
            })
        }
        const token=jwt.sign({name,email,password},process.env.JWT_ACCOUNT_ACTIVATION,{expiresIn:'10m'});
        const activateLink = `${process.env.CLIENT_URL}/auth/activate/${token}`;
        const emailData={
            to:[
                {address:email,
                name,}
            ],
            from:{
                address:process.env.EMAIL_FROM,
                name:'Anonymous'
            },
            subject:`Account activation Link`,
            html:`
              <div>
              <h1> please use the following link to activate the account </h1>
              <a href='${activateLink}' target='_blank'>${activateLink}</a>
              <hr/>
              <p> This email contains sensitive information</p>
              <a href="${process.env.CLIENT_URL}" target="_blank">${process.env.CLIENT_URL}</a>
              </div>
            `
        }
        transport.sendMail(emailData,(err,info)=>{
            if(err){
                return res.status(200).json({error:err});
            }
            return res.json({
                message:`Link has already been sent to your email ${email} , please follow the instruction to activate the link`

            })
        })
    })
}

exports.activateAccount=(req,res)=>{
    const {token}=req.body;
    if(token){
       return jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION,(err)=>{
            if(err){
                return res.status(401).json({
                    error:'The link has expired'
                });
            }
            const {name,email,password}=jwt.decode(token);
            const newUser=new User({name,email,password});
            User.findOne({email}).exec((err,user)=>{
                if(err){
                    return res.status(400).json({
                        error:'something went wrong'
                    })
                }
                if(user){
                    return res.status(400).json({
                        error:'User already exist'
                    })
                }
                newUser.save((err,userData)=>{
                    if(err){
                        return res.status(400).json({
                            error:'Something went wrong'
                        })
                    }
                    return res.json({
                        message:`hey , ${name} !! welcome to app!!`
                    })

                })
            })
        })

    }
    return res.status(401).json({
        error:'token is invalid'
    })
}
exports.signIn=(req,res)=> {
    const {email,password}=req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"user does not found of this email"
            });
        }
        if(!user.authenticate(password)){
            return res.status(400).json({
                error:"password is incorrect"
            });
        }
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{
            expiresIn:'7d'
        });
        const {_id,name,email,role}=user;
        return res.json({
            token,
            user:{
                _id,email,role,name,
            },
            message:"successfully signed In"
        })
    })
}
exports.forgotPassword=(req,res)=>{
    const {email}=req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"email does not exist"
            });
        }
        const token=jwt.sign({_id:user._id,name:user.name},process.env.JWT_RESET_PASSWORD,{
            expiresIn:'10m'
        });
        const link=`${process.env.CLIENT_URL}/auth/password/reset/${token}`
        const emailData={
            from:process.env.EMAIL_FROM,
            to:email,
            subject:`password reset link`,
            html:`
            <h1> please use the following link to reset password </h1>
            <a href="${link}" target="_blank">${link}</a>
            `
        }
        user.updateOne({resetPasswordLink:token}).exec((err,success)=>{
            if(err){
                return res.status(400).json({
                    error:`something problem in saving token`
                })
            }
            transport.sendMail(emailData).then(()=>{
                return res.json({
                    message:`email has been sucessfully sent to ${email}`

                })
            }).catch(err=>{
                return res.status(400).json({
                    error:`something went wrong in sending email`
                })
            })
        });
    })
    
}
exports.resetPassword=(req,res)=>{
    const {resetPasswordLink,newPassword}=req.body;
    if(resetPasswordLink){
        return jwt.verify(resetPasswordLink,process.env.JWT_RESET_PASSWORD,(err)=>{
            if(err){
                return res.status(400).json({
                    error:"Expired Link ! please,try again"
                });
            }
            User.findOne({resetPasswordLink}).exec((err,user)=>{
                if(err || !user){
                    return res.status(400).json({
                        error:'something went wrong try again'
                    })
                }
                const updateField={
                    password:newPassword,
                    resetPasswordLink:""
                };
                user=_.extend(user,updateField);
                user.save((err)=>{
                    if(err){
                        return res.status(400).json({
                            error:'error in reseting password'
                        })
                    }
                    return res.json({
                        message:'sucessfully passsword reset'
                    })
                })
            })
        })
    }
}