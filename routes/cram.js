var express = require("express"),
    router  = express.Router(),
    Account  = require("../models/account"),
    moment = require("moment"),
    mac_address = require('getmac'),
    spawn = require("child_process").spawn,
    middleware = require("../middleware/mails");

    const cloud_name = process.env.cloudinaryCloudName,
          api_key = process.env.cloudinaryAPIkey,
          api_secret = process.env.cloudinaryAPIsecret
    
    cloudinary.config({ 
    cloud_name: cloud_name, 
    api_key: api_key,
    api_secret: api_secret
    });


router.post("/images", upload.array('Images'), function(req, res){
    let p = new Promise(function(resolve, reject){
    // Function for deleting images lcoally
    function deleteFile(path){
        fs.unlink(path, (err) => {
        if (err) throw err;
        console.log('successfully deleted the local Image with the following path ', path);
        });
    }
    if(req.files == undefined)
        {
            var err = "No file(s) was selected.";
            res.render("./index", {err});
        }
        else
        {

            var date = moment().format("MMMM Do YY"),
                now_pretty = moment().format('MMMM Do YYYY, h:mm:ss a'); 
            var MAC = '';
            mac_address.getMac(function(err,macAddress){
                if (err)  throw err;
                MAC = macAddress;  
            });
            var files = [];
            req.files.forEach((file)=>{
                files.push("./" + file.path);
            });
            var process = spawn('python',["./main.py", files, MAC, now_pretty, cloud_name, api_key, api_secret]);

            process.stdout.on('data', (data) => {
                console.log(String.fromCharCode.apply(null, data));
            });
            
            Account.findOne({"mac_address": MAC.toLowerCase()}).exec((err, foundAccount)=>{
                if(err)
                {
                    throw err;
                }
                if(!foundAccount)
                {
                    var new_account = 
                    {
                        mac_address : MAC,
                        times_used : 1,
                        images_taken : files.length(),
                        email_address : req.body.email_address,
                        last_used : now_pretty
                    }
                    var create_account = ()=>
                    {
                        Account.create(new_account, (err, newAccount)=>{
                            if(err)
                            {
                                if(err.code === 11000)
                                {
                                    console.log("Duplicate index error.");
                                    Account.collection.dropIndex("username_1", (err, index_drop)=>{
                                        if(err)
                                        {
                                            throw new Error(err.message);
                                        }
                                        create_account();
                                    });
                                }
                                else
                                {
                                    throw new Error(err.message);
                                }
                            }
                            else
                            {
                                console.log("New user created and logged in with MAC address and email address. Time = ", now_pretty);
                            }

                        });
                    }
                }
                else
                {
                    foundAccount.times_used += 1;
                    foundAccount.last_used = now_pretty;
                    foundAccount.images_taken += files.length();
                    foundAccount.save();
                    console.log("Updated Previous Users' data.");
                }
            });
                

        }
    });
});
        

module.exports = router;