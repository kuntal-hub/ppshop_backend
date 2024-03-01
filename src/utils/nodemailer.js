import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.GMAIL_APP_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

  const sendMail = async (options) => {
  
    const mailOptions = {
      from: {
        name: "CodeStudio",
        address: process.env.GMAIL_APP_USER
      },
      to: options?.email,
      subject: "Reset your password",
      text: `Hello ${options?.username},\n\nYou are receiving this email because we received a password reset request for your account.\n\nYour Password reset OTP is : ${options?.otp}\n\nIf you did not request a password reset, no further action is required.\n\nThanks,\nCodeStudio`,
    };

    transporter.sendMail(mailOptions,(err,info)=>{
      if (err) {
        console.log(false);
        return false;
      } else {
        console.log(true)
        return true;
      }
    })
  }

  // options = {otp, email, username}
  export { sendMail }