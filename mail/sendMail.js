require("dotenv").config()
const nodemailer = require("nodemailer");


const mailHelper=async function (data){

    const transport = nodemailer.createTransport({
        host:process.env.NODEMAILER_HOST,
        port:process.env.NODEMAILER_PORT,
        auth: {
          user:process.env.NODEMAILER_USER,
          pass:process.env.NODEMAILER_PASS
        }
      });

console.log("inside email",data)
const message={
    from: "sujaldhiman2003@gmail.com", // sender address
    to:data.email , // list of receivers
    subject: data.subject, // Subject line
    text:data.message // plain text body
  }

  await transport.sendMail(message)
  console.log("Email Sent")
}

module.exports=mailHelper
