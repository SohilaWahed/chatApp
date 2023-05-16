const nodemailer = require('nodemailer')

const sendemail =  async options =>{
    // create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    //define the email options
    const mailOptions = {
        from: 'Sohila Wahed <SohilaWahed@gmail.com>',
        to : options.email,
        subject: options.subject,
        text: options.message
    }
    // active send the email 
    await transporter.sendMail(mailOptions)
}
module.exports = sendemail