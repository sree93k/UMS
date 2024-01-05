
const express=require("express")
const admin_route=express()
const cookieParser=require('cookie-parser')
const session=require("express-session")

//configuration
const config=require("../config/config")

//session
admin_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}))

//cookie
admin_route.use(cookieParser())

//url encode
admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:true}))

//view engine
admin_route.set("view engine","ejs")
admin_route.set("views","./views/admin")

//auth
const auth=require("../middlewares/adminAuth")

//multer
const multer=require("multer")
const path=require("path")
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){
        const name=Date.now()+"-"+file.originalname
        cb(null,name)
    }
})
const upload=multer({storage:storage})

//controller
const adminController=require("../controllers/adminController")

//login admin
admin_route.get('/',auth.isLogout,adminController.adminLogin)
admin_route.post('/',adminController.adminVerify)

//admin home
admin_route.get('/home',auth.islogin,adminController.adminHome)

//admin logout
admin_route.post('/adminlogout',auth.islogin,adminController.adminLogout)

//dashboard
admin_route.get('/dashboard',auth.islogin,adminController.adminDashboard)

//add new user
admin_route.get('/new_user',auth.islogin,adminController.addNewUser)
admin_route.post('/new_user',upload.single('image'),adminController.addUser)

//edit user
admin_route.get('/edituser',auth.islogin,adminController.userEdit)

//edit user post
admin_route.post('/edituser',upload.single('image'),adminController.updateUsers)

//deleteuser
admin_route.get('/deleteuser',auth.islogin,adminController.deleteUser)

// reset password
admin_route.get('/passwordreset',auth.islogin,adminController.resetPassword)

//update password
admin_route.post('/passwordreset',upload.single('image'),adminController.updatePassword)



//query misdirection avoid setup
admin_route.get('*',(req,res)=>{
    res.redirect('/admin/home')
})


// catch 404 and forward to error handler
// admin_route.use(function(req, res, next) {
//     next(createError(404));
//   });
  
//   // error handler
//   admin_route.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   })

//exports
module.exports=admin_route
