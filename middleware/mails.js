var nodemailer = require("nodemailer");
var mailingObj = {};

 mailingObj.send_PDF_file = function(emailAddress, date, fileName, PDF_file_link){

    nodemailer.createTestAccount(function(err, account){
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth:
            {
                user : process.env.email_address,
                pass : process.env.email_password
            }
        });
        let mailOptions = {
            from : process.env.email_address,
            to  :  emailAddress,
            subject : 'Crammer : Your Recent File [' + date + ']',
            text : "Your recent PDF and Word Document Files. Good luck on finishing that assignment way before due date.",
            attachments: 
            {
                filename: fileName,
                path: PDF_file_link
            }
        };
    
        transporter.sendMail(mailOptions, function(err, info){
            if(err)
            {
                console.log(err);
            }
            else
            {
                console.log('Message sent successfully', info.messageId);
                console.log("**************");
                console.log(info);
            }
        });
    });

};

module.exports = mailingObj;