const session = require("express-session")
const User=require("../models/userModel")
const bcrypt=require("bcrypt")
const { query } = require("express")



//password encrypt
const securePassword=async(password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}


//user login
const loginUser=async(req,res)=>{
    try {
        
        res.set("Cache-control","no-store")
        console.log("helo user")  
        user_error=req.session.user_error
        user_success=req.session.user_success
       
        req.session.user_error=false
        req.session.user_success=false
        
        console.log("scuess") 
        res.render('login',{user_error,user_success})
    } catch (error) {
        console.log(error.message)
    }
}

//resgistration
const loadRegister=async(req,res)=>{
    try {
        console.log("resgiter forms iiiii")
        user_error=req.session.user_error
        req.session.user_error=false
        res.render("registration",{user_error})
    } catch (error) {
        console.log(error.message)
    }
}

//user details enter
const insertUser=async(req,res)=>{
    try {
        console.log('start 1')
        const name=req.body.name
        const email=req.body.email
        const mobile=req.body.mobile
       
        console.log('start 2')
       
        const image=req.file.filename
       
       
        console.log('start 3')
        const password=req.body.password
        const password1=req.body.password1
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        console.log('start 4')
        if(!emailRegex.test(email))
        {
            if(!email.endsWith('.com'))
            {   
                req.session.user_error="Email must end with .com"
                res.redirect('/user')
                //res.render("registration",{message:"Email must end with .com"})
            }
            else
            {
                req.session.user_error="Invalid Email ID"
                res.redirect('/user')
            // res.render("registration",{message:"Invalid Email ID"})
            }
        }
       else
       {
        if(password!==password1 || password.includes(' '))
        {
            req.session.user_error="Invalid Password"
            res.redirect('/user')
            // res.render('registration',{message:"Invalid Password"})
        }
        else
        {
            const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.session.user_error="Account is already existing, Please Sign In"
            res.redirect('/user')
            
        }
        else
        {
        
                const spassword=await securePassword(password)
                console.log('start 5')
                const user= new User({
                    name:name,
                    email:email,
                    mobile:mobile,
                    image:image,
                    password:spassword,
                    is_admin:0
                }) 
                const userData=await user.save()
                console.log('start 6')
                if(userData)
                {
                    console.log('start 7')
                    req.session.user_success="Your registration has been successfull!Please wait until verified"
                    res.redirect('/user')
                    
                }
                else
                {
                    req.session.user_error="Your regisatration has been failed,Try again"
                    res.redirect('/user')
                    // res.render("registration",{message:"Your regisatration has been failed,Try again"})
        }
        
        }
        }
        }
      
        
    } catch (error) {
        console.log(error.message)
    }
}


//verify login

const verifyLogin=async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password
        console.log("ver");
        console.log(req.body);
        const userData= await User.findOne({email:email})
        console.log("step1")
        if (userData) {
            console.log("step2")
            const passwordMatch= await bcrypt.compare(password,userData.password)
            console.log("step3")
            if (passwordMatch) {
                console.log("step4")
                console.log(userData.is_verified)
                console.log("step5")
                if (userData.is_verified===0) {
                    console.log("step5")
                    req.session.user_error="Account is not verified. Please try after sometime."
                    console.log("verify")
                    res.redirect('/user')
                } else {
                    console.log("step6")
                    req.session.user_id=userData._id;
                    res.redirect('/user/home')
                }
                
            } else {
                req.session.user_error="Email and Passowrd incorrect"
                res.redirect('/user')
            }
        } else {
            req.session.user_error="Email and Passowrd incorrect"
            res.redirect('/user')
            
        }

    } catch (error) {
        console.log(error.message)
    }
}

//user home 
const userHome=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        user_update=req.session.user_update
        req.session.user_update=false
        const userData=await User.findById({_id:req.session.user_id,user_update})
        if(userData)
        {
            res.render('home',{user:userData})
        }
        else{
            req.session.destroy();
            res.redirect('/user')
        }
        
    } catch (error) {
       console.log(error.message) 
    }
}

//session logout 
const userLogout=async(req,res)=>{
    try {
        req.session.destroy()
       console.log("user logout")
        res.redirect("/user") 
        
    } catch (error) {
        console.log(error.message);
    }
}


//user edit 

const userEdit=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        const id=req.query.id

        const userData=await User.findById({_id:id})
        if (userData) {
            res.render('edit',{user:userData})
            console.log("hii")
        } else {
            
            res.redirect('/user/home')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//user update
const userUpdate=async(req,res)=>{
    try {
        if (req.file) {
            const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,image:req.file.filename}})
        } else {
            const userData=await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile}})
        }
        req.session.user_update="Update Successfully"
        res.redirect("/user/home")
    } catch (error) {
        console.log(error.message)
    }
}

//user forgot password
const resetUserPassword=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        console.log("hello reset")
        const id=req.query.id
        console.log('hii reset ')
        const userData=await User.findById({_id:id})
        console.log('second ')
        if(userData){
            console.log('entered')
            res.render('passwordreset',{user:userData})
        }
        else
        {
            console.log('out ')
            res.redirect('/user/edit')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}

const updatePassword=async(req,res)=>{
    try {
        console.log("helooooooo")
        if(req.body.newpassword==req.body.oldpassword)
        {
            console.log("entered")
            const spassword=await securePassword(req.body.newpassword)
            const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{password:spassword}})
            req.session.user_update="Reset password Successfully"
            res.redirect('/user/home')
        }
        else
        {
            res.redirect('/user/passwordreset')
        }
        res.redirect('/user/edit')
        
    } catch (error) {
        console.log(error.message)
    }

}


//exporting 
module.exports={loadRegister,
    insertUser,
    loginUser,
    verifyLogin,
    userHome,
    userLogout,
    userEdit,
    userUpdate,
    resetUserPassword,
    updatePassword
}