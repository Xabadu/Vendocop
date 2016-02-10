var Nodemailer = require('nodemailer');
var Promise = require('promise');
var mail = require('../config/mail');

var mailer = module.exports = {
  transporter: Nodemailer.createTransport(mail.smtpConfig),
  send: function(type, messages, callback, override, params) {
    var transporter = this.transporter;
    var mailInfo = mail[type];
    if(override) {
      mailInfo = Object.assign({}, mailInfo, override);
    }
    mailInfo.text = mailInfo.html = messages.shift();
    transporter.sendMail(mailInfo, function(error, info) {
      if(error) {
        console.log(error);
      }
      callback(messages, type, params);
    });
  }
};
