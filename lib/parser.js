var fs = require('fs');
var _ = require('lodash');

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
      }
      else if(template == 'sales-individual') {
        var row = data.shift();
        var sales = row.sales;
        var salesData = '';
        delete row.sales;
        var keys = Object.keys(row);
        row.today = _.capitalize(row.today);
        for(var j = 0, length = keys.length; j < length; j++) {
          message = message.replace('%' + keys[j] + '%', row[keys[j]]);
        }
        for(var j = 0, length = sales.length; j < length; j++) {
          switch(sales[j].payment_method) {
            case 1: sales[j].payment_method = 'Efectivo';
                    break;
            case 2: sales[j].payment_method = 'Débito';
                    break;
            case 3: sales[j].payment_method = 'Crédito';
                    break;
          }
          salesData = salesData.concat('<tr><td>'+sales[j].sales_sku+'</td><td>'+sales[j].sales_product_name+'</td><td>'+sales[j].sales_price+'</td>');
          salesData = salesData.concat('<td>'+sales[j].sales_quantity+'</td><td>'+sales[j].sales_total+'</td><td>'+sales[j].payment_method+'</td>');
          salesData = salesData.concat('<td>'+sales[j].sale_date+'</td><td>'+sales[j].time_date+'</td></tr>');
        }
        message = message.replace('%sales%', salesData);
        callback(row, data, message);
      }
    });
  }
};
