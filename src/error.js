var fs = require('fs');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var db = require('../config/db');
var mail = require('../config/mail').error;
var smtpConfig = require('../config/mail').smtpConfig;

var connection = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database
});

connection.connect(function(err) {
  if(err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  checkErrors(connection);
});

function checkErrors(connection) {
  connection.query(db.errorsQuery, function(error, results, fields){
    var total = results.length;
    if(total > 0) {
      var transporter = nodemailer.createTransport(smtpConfig);
      fs.readFile('./resources/templates/error.html', 'utf8', function(err, html) {
        for(var i = 0; i < total; i++) {
          mail.text = prepareMessage(html, results[i]);
          mail.html = prepareMessage(html, results[i]);
          transporter.sendMail(mail, function(error, info) {
            console.log('Enviado :' + info.response);
          });
        }
      });
    }
    connection.end();
  });
}

function prepareMessage(template, content) {
  var message = template.replace('%created_at%', content.error_created);
  message = message.replace('%store_name%', content.store_name);
  message = message.replace('%location_name%', content.location_name);
  message = message.replace('%error_name%', content.error_name);
  message = message.replace('%device_name%', content.device);
  message = message.replace('%urgency%', content.urgency);
  message = message.replace('%description%', content.description);
  return message;
}
