const mainLoad=async(req,res)=>{
    try {
        res.set("Cache-control","no-store")
        res.render('main')
    } catch (error) {
        console.log(error.message)
    }
}



module.exports={mainLoad}