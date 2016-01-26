var mysql = require('mysql');
var nodemailer = require('nodemailer');
var db = require('../config/db');
var mail = require('../config/mail').error;
var smtpConfig = require('../config/mail').smtpConfig;
var parser = require('../lib/parser');

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

var dispatchMessage = function(row, message, connection) {
  var transporter = nodemailer.createTransport(smtpConfig);
  mail.text = mail.html = message;
  transporter.sendMail(mail, function(error, info) {
    console.log('Enviado: ' + info.response);
    if(error === null) {
      connection.query(db.updateQuery + row.error_id, function(error, results, fields) {
        connection.end();
      });
    }
  });
}

function checkErrors(connection) {
  connection.query(db.errorsQuery, function(error, results, fields){
    var total = results.length;
    if(total > 0) {
      var transporter = nodemailer.createTransport(smtpConfig);
      for(var i = 0; i < total; i++) {
        var row = results[i];
        parser.template(row, 'error', connection, dispatchMessage);
      }
    } else {
      connection.end();
    }
  });
}
