const express=require("express")
const main_route=express()
const cookieParser=require('cookie-parser')
const session=require("express-session")

//configuration
const config=require("../config/config")
//session
main_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false
}))

//cookie
main_route.use(cookieParser())

//view engine
main_route.set("view engine","ejs")
main_route.set("views","./views/main")

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
const mainController=require("../controllers/mainController")

//to see user home images
main_route.use(express.static('public'))

//main routes
main_route.get('/',mainController.mainLoad)
main_route.get('/main',mainController.mainLoad)

//main to adminlogin
// main_route.get('/admin/login',mainController.)

// catch 404 and forward to error handler
// main_route.use(function(req, res, next) {
//     next(createError(404));
//   });
  
//   // error handler
//   main_route.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
  
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
//   })

//query misdirection avoid setup
//query misdirection avoid setup
main_route.get('*',(req,res)=>{
  res.redirect('/main')
})


//export
module.exports=main_route




