//https://mailtrap.io/

const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //1 create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //2 define email options
  const emailOptions = {
    from: 'Andre Ramos da Silva <andre.ramos1994@hotmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  //3 actually sent the email

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
