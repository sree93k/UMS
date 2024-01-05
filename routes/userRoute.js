const express=require("express")
const user_route=express()

const session=require("express-session")


//configuration
const config=require("../config/config")
//session
user_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}))



//authentication
const auth=require("../middlewares/auth")

//view engine -ejs
user_route.set("view engine","ejs")
user_route.set("views","./views/users")

//url enocode
user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

//to see user home images
user_route.use(express.static('public'))


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
//multer end

//controller
const userController=require("../controllers/userController")
// const cookieParser = require("cookie-parser")

//login user
user_route.get('/',auth.isLogout,userController.loginUser)
user_route.post('/',userController.verifyLogin)

//user home
user_route.get('/home',auth.isLogin,userController.userHome)

//user register
user_route.get("/register",auth.isLogout,userController.loadRegister)
user_route.post("/register",upload.single("image"),userController.insertUser)

//session logout
user_route.post('/logout',auth.isLogin,userController.userLogout)

//user home page edit
user_route.get('/edit',auth.isLogin,userController.userEdit)

//user page update
user_route.post('/edit',upload.single("image"),userController.userUpdate)

//reset password
user_route.get('/passwordreset',auth.isLogin,userController.resetUserPassword)

//update password
user_route.post('/passwordreset',upload.single("image"),userController.updatePassword)

user_route.get('*',(req,res)=>{
    res.redirect('/user/home')
})


// catch 404 and forward to error handler
// user_route.use(function(req, res, next) {
//     next(createError(404));
//   });
  
  // error handler
//   user_route.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   })

  //query mispalceing setup

module.exports=user_route  