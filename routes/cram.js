var express = require("express"),
    router  = express.Router(),
    Account  = require("../models/account"),
    moment = require("moment"),
    multer = require("multer"),
    mac_address = require('getmac'),
    cryptoRandomString = require('crypto-random-string'),
    middleware_mail = require("../middleware/mails"),
    path = require("path"),
    fs = require("fs"),
    PDFDocument = require('pdfkit'),
    Jimp = require("jimp"),
    sizeOf = require("image-size"),
    cloudinary = require('cloudinary');
    const cloud_name = process.env.cloudinary_cloud_name,
          api_key = process.env.cloudinary_API_key,
          api_secret = process.env.cloudinary_API_secret
    
    cloudinary.config({ 
    cloud_name: cloud_name, 
    api_key: api_key,
    api_secret: api_secret
    });

    // Multer configuration

    const storage = multer.diskStorage({
        destination : './public/uploads',
        filename : function(req, file, cb){
            cb(null, file.fieldname + '-' + Date.now() + '-' + cryptoRandomString(({length: 29, characters: '1234567890'})) + path.extname(file.originalname));
        } 
    });
    
    const upload = multer({
        storage : storage,
        limits: { fileSize: 1024*1024*10},
        fileFilter: async function(req, file, cb){
            checkFileType(file, cb);
        }
    });
    
    function checkFileType(file, cb){
        // Allowed ext
        const filetypes = /jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);
        console.log("Form the function", mimetype, extname);
        if(mimetype && extname){
          return cb(null,true);
        } else {
          console.log("In here...");
          return cb('File type not supported. File should be an image with .jpg, .png, or .jpeg extension');
        }
      }
    

router.post("/images", upload.array('Homework'), function(req, res){
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
        return res.render("./index", {err});
    }
    else
    {

        var date = moment().format("MMMM Do YYYY"),
            now_pretty = moment().format('MMMM Do YYYY, h:mm:ss a'); 

        var MAC = req.header('x-forwarded-for') || req.connection.remoteAddress;
        console.log(MAC);
        var files = [];

        req.files.forEach((file)=>{
            files.push("./" + file.path);
        });
        
        
        doc = new PDFDocument();

        /**
         * Cloudinary Alternative...
        */
        //************************
        var cloudinary_links = [];
        files.forEach(async(one)=>{
            await cloudinary.v2.uploader.upload(one, async(err, result)=>{
                if(err)
                {
                    console.log("Error noticed when uploading image to cloudinary.", error);
                    return res.redirect("/");
                }
                else
                {
                    var new_cloudinary_image = result.secure_url;
                    
                    console.log(new_cloudinary_image);
                   sizeOf(one, function (err, dimensions) {
                        var width = dimensions.width,
                            height = dimensions.height;
                        if(width < height)
                        {
                            new_cloudinary_image = new_cloudinary_image.split("/image/upload")[0] + "/image/upload/a_270" + new_cloudinary_image.split("/image/upload")[1];
                        }
                        cloudinary_links.push(new_cloudinary_image);
                        console.log(cloudinary_links);
                    });
                }
            });
        });
        console.log("Plz work?");
        console.log(cloudinary_links);        
        var new_files = [];
        req.files.forEach((one)=>{
            one = one.path;
            if(path.extname(one).toLowerCase() == '.jpg')
            {
                Jimp.read(one, function (err, image) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(one);
                        image.write("./" + one.split(".")[0] + ".png");
                        new_files.push("./" + one.toLowerCase().split(".")[0] + ".png");
                        // deleteFile(one.toLowerCase().split(".jpg")[0] + ".png");
                    }
                });
            }
            else
            {
                if(one.split(".")[1] == "PNG")
                {
                    one = one.split(".")[0] + ".png";
                }
                new_files.push(one);
            }
        });
              


        //Pipe its output somewhere, like to a file or HTTP response 
        //See below for browser usage 
        doc.pipe(fs.createWriteStream('public/uploads/'+req.body.assignment_name + '.pdf'));
        var header = req.body.assignment_name + ", " + date;
        doc.fontSize(16);

        doc.text(header,
            {
                width: 410,
                align: 'center'
            });
        doc.moveDown();
        //Add an image, constrain it to a given size, and center it vertically and horizontally 
        for(var i = 0; i < new_files.length; i++)
        {
                doc.image(new_files[i], {
                    fit: [500, 500],
                    align: 'center',
                    valign: 'center',
                    rotate:90
                    });
                    doc.rotate(90, {origin : [0, 0]});
                doc.addPage();
                doc.moveDown();
        }
        doc.moveDown();
        doc.moveDown();

        doc.fontSize(13);
        doc.text("Generated by Crammer",
        {
            width : 410,
            align:'center'
        });
        doc.fontSize(9);
        doc.moveDown();

        doc.text("https://crammer_ai.herokuapp.com",
        {
            width : 410,
            align:'center'
        });
        doc.moveDown();
        doc.moveDown();

        doc.text("A Qasim Wani Product, https://github.com/QasimWani/Crammer",
        {
            width:410,
            align:'center'
        });

        doc.end();
        // files.forEach((path)=>{
        //     deleteFile(path);
        // });
        //***********************/
        // function to encode file data to base64 encoded string
        
        // var spawn = require('child_process').spawn,
        // py    = spawn('python', ['main.py']),
        // data = [files, MAC, now_pretty, cloud_name, api_key, api_secret],
        // dataString = '';
        // console.log(data);
        // py.stdout.on('data', function(data){
        // dataString += data.toString();
        // });
        // py.stdout.on('end', function(){
        // console.log('All the data ',dataString);
        // });
        // py.stdin.write(JSON.stringify(data));
        // py.stdin.end();
        
        console.log("Goes here...");

        Account.findOne({"mac_address": MAC.toLowerCase()}).exec((err, foundAccount)=>{
            if(err)
            {
                throw err;
            }
            if(!foundAccount)
            {
                var new_account = 
                {
                    mac_address : MAC.toLowerCase(),
                    times_used : 1,
                    images_taken : files.length,
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
                create_account();
            }
            else
            {
                foundAccount.times_used += 1;
                foundAccount.last_used = now_pretty;
                foundAccount.images_taken += files.length;
                foundAccount.save();
                console.log("Updated Previous Users' data.");
            }
        });
        var file_name = './public/uploads/'+req.body.assignment_name + '.pdf';
            middleware_mail.send_PDF_file(req.body.email_address, date, req.body.assignment_name + ".pdf", file_name);
    }
    return res.render("index",{err:"Sent you an email!"});
});        

module.exports = router;