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

var transporter = nodemailer.createTransport(smtpConfig);

connection.connect(function(err) {
  if(err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  connection.query(db.setLocaleQuery, function(error, results, fields) {
    generateSalesReport(process.argv[2]);
  });
});

var dispatchMessage = function(type, row, data, message) {
  if(type == 'individual') {
    mail.subject = 'Reporte de ventas diarias ' + row.store_name + ' ' + row.store_location;
  } else if(type == 'summary') {
    mail.subject = 'Resumen de ventas diarias';
  }
  mail.text = mail.html = message;
  transporter.sendMail(mail, function(error, info) {
    if(type == 'individual') {
      console.log('Enviado: ' + row.store_name + ' ' + row.store_location);
      if(data.length > 0) {
        parser.template(data, 'sales-individual', null, dispatchMessage);
      }
    }
    console.log('Enviado ' + info.response);
    return;
  });
}

function generateSalesReport(type) {
  if(type == 'individual') {
    connection.query(db.getStoresSalesQuery, function(error, results, fields){
      if(results.length > 0) {
        var parsedData = prepareSalesData(results);
        parser.template(parsedData, 'sales-individual', connection, dispatchMessage);
      }
      connection.end();
    });
  } else if(type == 'summary') {
    connection.query(db.getSalesSummaryQuery, function(error, results, fields) {
      if(results.length > 0) {
        var parsedData = prepareSalesSummary(results);
        parser.template(parsedData, 'sales-summary', connection, dispatchMessage);
      }
    });
  }
}

function prepareSalesData(original) {
  var data = [];
  for(var i = 0, total = original.length; i < total; i++) {
    var temp = original.shift();
    var exists = false;
    var position;
    for(var j = 0, length = data.length; j < length; j++) {
      if(data[j].store_name == temp.store_name && data[j].store_location == temp.store_location) {
        exists = true;
        position = j;
      }
    }
    var sale_final = temp.sales_price * temp.sales_quantity;
    if(exists) {
      var sale = {
        sales_sku: temp.sales_sku,
        sales_product_name: temp.sales_product_name,
        sales_price: temp.sales_price,
        sales_quantity: temp.sales_quantity,
        sales_total: sale_final,
        payment_method: temp.payment_method,
        sale_date: temp.sale_date,
        time_date: temp.time_date
      };
      data[position].sales_total += sale_final;
      data[position].sales.push(sale);
    } else {
      var store = {
        today: temp.today,
        store_name: temp.store_name,
        store_location: temp.store_location,
        store_metadata: temp.store_metadata,
        sales_total: sale_final,
        sales: [{
          sales_sku: temp.sales_sku,
          sales_product_name: temp.sales_product_name,
          sales_price: temp.sales_price,
          sales_quantity: temp.sales_quantity,
          sales_total: sale_final,
          payment_method: temp.payment_method,
          sale_date: temp.sale_date,
          time_date: temp.time_date
        }]
      };
      data.push(store);
    }
  }
  return data;
}

function prepareSalesSummary(original) {
  var data = {
    today: original[0].today,
    sales: original
  };
  var amount = 0, products = 0, transactions = 0;
  for(var i = 0, total = original.length; i < total; i++) {
    amount += original[i].sales_amount;
    products += original[i].products_total;
    transactions += original[i].sales_total;
  }
  data.sales_amount = amount;
  data.sales_products = products;
  data.sales_transactions = transactions;
  return data;
}
