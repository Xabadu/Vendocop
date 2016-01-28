var mysql = require('mysql');
var nodemailer = require('nodemailer');
var db = require('../config/db');
var mail = require('../config/mail').error;
var smtpConfig = require('../config/mail').smtpConfig;
var parser = require('../lib/parser');

if(process.argv[2] !== 'individual' && process.argv[2] !== 'summary') {
  return false;
}

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
  generateSalesReport(process.argv[2], connection);
});

var dispatchMessage = function(row, message, connection) {
  var transporter = nodemailer.createTransport(smtpConfig);
  mail.text = mail.html = message;
  transporter.sendMail(mail, function(error, info) {
    console.log('Enviado: ' + info.response);
  });
}

function generateSalesReport(type, connection) {
  if(type == 'individual') {
    connection.query(db.getStoresQuery, function(error, results, fields){
      var stores = results;
      var total = stores.length;
      if(total > 0) {
        for(var i = 0; i < total; i++) {
          var row = stores[i];
          row.sales = [];
          connection.query(db.getStoresSalesQuery + row.store_id, function(error, results, fields) {
            row.sales = results;
            parser.template(row, 'sales-individual', connection, dispatchMessage);
          });
        }
      } else {
        connection.end();
      }
    });
  } else if(type == 'summary') {

  }
}
