
const User=require("../models/userModel")
const bcrypt=require("bcrypt")


//password encrypt
const securePassword=async(password)=>{
    try {
        const passwordHash=await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}

//admin login
const adminLogin=async(req,res)=>{
    try {
      
        res.set("Cache-control","no-store")
        admin_error=req.session.admin_error
        req.session.admin_error=false
        res.render('login',{admin_error})
    } catch (error) {
        console.log(error.message)
    }
}

//add user post method
const addUser=async(req,res)=>{
    try {

        const name=req.body.name
        const email=req.body.email
        const mobile=req.body.mobile
        const image=req.file.filename
        const password=req.body.password
        const password1=req.body.password1
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if(!emailRegex.test(email))
        {
            if(!email.endsWith('.com'))
            {
                req.session.status="Email must end with .com"
                res.redirect('/admin/dashboard')
                // res.render("new_user",{message:"Email must end with .com"})
            }
            else
            {
                req.session.status="Invalid Email ID"
                res.redirect('/admin/dashboard')
            // res.render("new_user",{message:"Invalid Email ID"})
            }
        }
        else
        {
            if(password!==password1 || password.includes(' '))
            {
                console.log("invlid password")
                req.session.status="Invalid Password"
                res.redirect('/admin/dashboard')
                
            } 
            else
            {
                const existingUser=await User.findOne({email:email})
                if(existingUser)
                {
                    console.log("step 1")
                    req.session.status="Account is already existing. Please Sign-in"
                    console.log(" step 2")
                    console.log(req.session.status);
                    res.redirect('/admin/dashboard')
                
                }
                else
                {
                    const spassword=await securePassword(password)
                    const user=new User({
                    name:name,
                    email:email,
                    mobile:mobile,
                    image:image,
                    password: spassword,
                    is_admin:0
        })

        const userData=await user.save()

        if(userData)
        {
            console.log("dashboard")
          
            req.session.register_success="Registered Successfully"
            res.redirect("/admin/dashboard")
            
        }
        else
        {
            console.log("something wrong")
            res.render("new_user",{message:"Something wrong"})

        }
    }
    }
}
        
    } catch (error) {
        console.log(error.message)
    }
}

//admin verify
const adminVerify=async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password
       
        const userData= await User.findOne({email:email})
        if(userData)
        {
            
            const passwordMatch=await bcrypt.compare(password,userData.password)
            
            if(passwordMatch){
                
                if(userData.is_admin===1 && userData.is_verified===1)
                {
                    req.session.user_id=userData._id;
                    console.log(" sucesss 1")
                    res.redirect("/admin/home")
                }
                else
                {   
                    console.log(" error 1")
                    req.session.admin_error="Account is not verified. Please wait until admin verified."
                    res.redirect('/admin')
                    // res.render('login',{message:"Account is not verified. Please wait until admin verified."})
                }
            }
            else
            {
                console.log(" error 2")
                req.session.admin_error="Invalid Email and Password"
                res.redirect('/admin')
                // res.render('login',{message:"Invalid Email and Password"})
            }
        }
        else
        {
            console.log(" error 3")
            req.session.admin_error="Invalid Email and Password"
            res.redirect('/admin')
            // res.render("login",{message:"Invalid Email and Password"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//admin home
const adminHome=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        const userData =await User.findById({_id:req.session.user_id})
        res.render("home",{admin:userData})
    } catch (error) {
        console.log(error.message)
    }
}

//admin logout
const adminLogout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


//dashboard
const adminDashboard=async(req,res)=>{
    try {
        console.log("step 3")
        res.set("Cache-control","no-store")
        var search=''
        if(req.query.search)
        {
            search=req.query.search
        }

        const usersData=await User.find({
            is_admin:0,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:"i"}},
                {email:{$regex:'.*'+search+'.*',$options:"i"}},
                {mobile:{$regex:'.*'+search+'.*',$options:"i"}}
            ]
        })
     
        rstatus=req.session.status
       register_success=req.session.register_success
       update_success=req.session.update_success
        req.session.status=false
        req.session.register_success=false
        req.session.update_success=false
        res.render('dashboard',{users:usersData,rstatus,register_success,update_success})
    } catch (error) {
        console.log(error.message)
    }
}

//add new user form
const addNewUser=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        res.render('new_user')
    } catch (error) {
        console.log(error.message)
    }
}

//edit user

const userEdit=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        const id=req.query.id
        const userData=await User.findById({_id:id})
        if(userData){
            res.render('edituser',{user:userData})
        }
        else
        {
            res.redirect('/admin/dashboard')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}


//update users edit
const updateUsers=async(req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,is_verified:req.body.verified }})
        req.session.update_success="Update Successfully"
        res.redirect('/admin/dashboard')

    } catch (error) {
        console.log(error.message)
    }
}

const deleteUser=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        const id=req.query.id
        
        await User.deleteOne({_id:id})
        console.log("new delete")
        req.session.status="Account Delete Successfully !"
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }   
}

const resetPassword=async(req,res)=>{
    try {
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
            res.redirect('/admin/dashboard')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}

const updatePassword=async(req,res)=>{
    try {
        if(req.body.newpassword==req.body.oldpassword)
        {
            console.log("entered")
            const spassword=await securePassword(req.body.newpassword)
            const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{password:spassword}})
            req.session.update_success="Password Reset Successfully !"
            res.redirect('/admin/dashboard')
            
        }
        else
        {
            res.redirect('/admin/passwordreset')
        }
        res.redirect('/admin/edituser')
        
    } catch (error) {
        console.log(error.message)
    }

}




module.exports={adminLogin,
    adminVerify,
    adminHome,
    securePassword,
    adminLogout,
    adminDashboard,
    addNewUser,
    addUser,
    userEdit,
    updateUsers,
    deleteUser,
    resetPassword,
    updatePassword
}
