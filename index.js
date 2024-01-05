const mongoose=require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/user_managment_system")

const express=require("express")
const app=express()



//for admin routes
const adminRoute=require("./routes/adminRoute")
app.use('/admin',adminRoute)

//for user routes
const userRoute=require("./routes/userRoute")
app.use('/user',userRoute)

//main route
const mainRoute=require("./routes/mainRoute")
app.use('/',mainRoute)


app.listen(3000,()=>{
    console.log("server started ....");
})

