var express = require("express"),
    router  = express.Router(),
    Double  = require("../models/account"),
    moment = require("moment"),
    middleware = require("../middleware/mails");

    router.post("/images", upload.array('Images'), function(req, res){
        let p = new Promise(function(resolve, reject){
        
        // Function for deleting images lcoally
        
        function deleteFile(path){
            fs.unlink(path, (err) => {
            if (err) throw err;
            console.log('successfully deleted the local Image with the following path ', path);
            });
        }
        if(req.files == undefined){
            var err = "No file(s) was selected.";
            res.render("./index", {err});
        }
        else
        {
            User.find({_id:req.user._id}, function(err, foundUser){
                if(err)
                    {
                        console.log("SOmething terrible went wrong, though unlikely");
                        console.log(err);
                        req.flash("error","Error.|Something went wrong.<br>Please try again later.<br>Error message : "+err.message);
                        res.redirect("back");
                    }
                    else
                    {
                        var IP_user = req.header('x-forwarded-for') || req.connection.remoteAddress;
                        var date = moment().format("MMMM Do YY"); 
                        var cloudinaryLink = [],
                            ImagesLink  = [];

                        req.files.forEach(function(file){
                            cloudinaryLink.push("./" + file.path);
                        });
        
                        cloudinaryLink.forEach(async function(path){
                            
                            cloudinary.v2.uploader.upload(path, {"crop":"limit","tags":[IP_user, 'Images'],"width":4000,"height":3000, folder: `${IP_user}/${date.split(" ")[0]}/${date}`,use_filename: true}, await function(error, result) {
                                if(error || !result)
                                {
                                    console.log("Error reported", error);
                                    req.flash("error","Error.|Something went wrong while trying to upload requested images onto our servers.<br>Please try again later.<br> Possible error : File Size too large (try uploading a different image).");
                                    reject("Line ~ 55");
                                }
                                else
                                {
                                    console.log("***********************************************************")
                                    console.log(result);
                                    console.log("***********************************************************")
        
                                    ImagesLink.push(result.secure_url);
                                    console.log("((((((((((((((((((((((((((((()))))))))))))))))))))))))))))))))))))))))))")
                                    console.log(ImagesLink);
                                    console.log("((((((((((((((((((((((((((((()))))))))))))))))))))))))))))))))))))))))))")
                                    syncWait();
                                }
                                
                            });
                                deleteFile(path);
                    function syncWait(){
                        if(ImagesLink.length == cloudinaryLink.length)
                        {
                            let allImages = ImagesLink.join();
                            console.log("Accepted");
                            var driverLink = {
                                Driver : {
                                    isDriver : true,
                                    Images : allImages,
                                    license : foundUser[0].Driver.license,
                                    seat : seat,
                                    plate : plate,
                                    country : country,
                                    state : state,
                                    payment : payment,
                                    car : car
                                    }
                                }
                            User.findByIdAndUpdate(foundUser[0]._id, driverLink, function(err, partialUpdatedUser){
                                if(err)
                                {
                                    console.log("Error", " approx ~ 208", err);
                                    req.flash("error","Error.|Something went wrong.<br>Please try again later.<br>Error message : "+err.message);
                                    reject("Line ~209");
                                }
                                else
                                {
                                    console.log("Updated. From. DB!");
                                    resolve("Successfully uploaded all the files");
                                }
                                
                            });
                        }
                    }
        
                    });
                    }
            });
            
        }
        
        });
        
        p.then(function(message){
            console.log("Confirmation : All images updated onto DB ", message);
            mailingSystem.newlyRegisteredDriver(req.user.username, req.user.name);
            req.flash("success","Congratulations on being a HitchHiqe verified driver.|Thank you for showing the patience while we validated your profile.<strong> Happy HitchHiqing!</strong>");
            return res.redirect("/drive/new");
        }).catch(function(message){
            console.log("Something went wrong! ", message);
            return res.redirect("/trip/drive");
        });
        
        });
        

module.exports = router;