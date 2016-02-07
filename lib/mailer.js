var Nodemailer = require('nodemailer');
var Promise = require('promise');
var mail = require('../config/mail');

module.exports = {
  transporter: Nodemailer.createTransport(mail.smtpConfig),
  send: function(type, messages, callback) {
    var transporter = this.transporter;
    var mailInfo = mail[type];
    mailInfo.text = mailInfo.html = messages.shift();
    transporter.sendMail(mailInfo, function(error, info) {
      if(error) {
        console.log(error);
      }
      callback(messages);
    });
  }
};
