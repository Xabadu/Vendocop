var fs = require('fs');
var _ = require('lodash');
var humanize = require('humanize');

module.exports = {
  template: function(data, template, connection, callback) {
    var message = '';
    fs.readFile(__dirname + '/../resources/templates/'+template+'.html', 'utf8', function(err, html) {
      message = html;
      if(template == 'error') {
        var keys = Object.keys(data);
        data.date_created = _.capitalize(data.date_created);
        for(var i = 0, length = keys.length; i < length; i++) {
          message = message.replace('%' + keys[i] + '%', data[keys[i]]);
        }
        callback(data, message, connection);
      } else if(template == 'sales-individual') {
        var row = data.shift();
        var sales = row.sales;
        var salesData = '';
        delete row.sales;
        var keys = Object.keys(row);
        row.today = _.capitalize(row.today);
        row.sales_total = '$' + humanize.numberFormat(row.sales_total, 0, ',', '.');
        for(var j = 0, length = keys.length; j < length; j++) {
          message = message.replace('%' + keys[j] + '%', row[keys[j]]);
        }
        for(var j = 0, length = sales.length; j < length; j++) {
          switch(sales[j].payment_method) {
            case 1: sales[j].payment_method = 'Crédito';
                    break;
            case 2: sales[j].payment_method = 'Débito';
                    break;
            case 3: sales[j].payment_method = 'Efectivo';
                    break;
          }
          sales[j].sales_price = '$' + humanize.numberFormat(sales[j].sales_price, 0, ',', '.');
          sales[j].sales_total = '$' + humanize.numberFormat(sales[j].sales_total, 0, ',', '.');
          salesData = salesData.concat('<tr><td>'+sales[j].sales_sku+'</td><td>'+sales[j].sales_product_name+'</td><td>'+sales[j].sales_price+'</td>');
          salesData = salesData.concat('<td>'+sales[j].sales_quantity+'</td><td>'+sales[j].sales_total+'</td><td>'+sales[j].payment_method+'</td>');
          salesData = salesData.concat('<td>'+sales[j].time_date+'</td></tr>');
        }
        message = message.replace('%sales%', salesData);
        callback('individual', row, data, message);
      } else if(template == 'sales-summary') {
        var sales = data.sales;
        var salesData = '';
        delete data.sales;
        data.today = _.capitalize(data.today);
        data.sales_amount = '$' + humanize.numberFormat(data.sales_amount, 0, ',', '.');
        var keys = Object.keys(data);
        for(var i = 0, length = keys.length; i < length; i++) {
          message = message.replace('%' + keys[i] + '%', data[keys[i]]);
        }
        for(var i = 0, length = sales.length; i < length; i++) {
          sales[i].sales_amount = '$' + humanize.numberFormat(sales[i].sales_amount, 0, ',', '.');
          salesData = salesData.concat('<tr><td>'+sales[i].store_name+' '+sales[i].store_location+'</td>');
          salesData = salesData.concat('<td style="text-align: right;">'+sales[i].sales_total+'</td><td style="text-align: right;">'+sales[i].sales_amount+'</td></tr>');
        }
        message = message.replace('%sales%', salesData);
        callback('summary', null, data, message);
      }
    });
  }
};
