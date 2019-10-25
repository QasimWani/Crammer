var nodemailer = require("nodemailer");
var mailingObj = {};

 mailingObj.signUpConfirmationEmail = function(emailAddress, date, word, pdf){

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
            attachments: [word, pdf]   
        /**
         * // use URL as an attachment
            filename: 'license.txt',
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
         */
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

