var Promise = require('promise');
var fs = require('fs');
var _ = require('lodash');
_.mixin(require("lodash-inflection"));
var humanize = require('humanize');
var Quiche = require('quiche');

var parser = module.exports = {
  getTemplate: function(template) {
    return new Promise(function(resolve, reject) {
      fs.readFile(__dirname + '/../resources/templates/'+template+'.html', 'utf8', function(err, html) {
        if(err) {
          reject(err);
        }
        resolve(html);
      });
    });
  },
  replaceContent: function(template, data) {
    var messages = [];
    return messages = data.map(function(obj) {
      var msg = template;
      for(var i = 0, keys = Object.keys(obj), length = keys.length; i < length; i++) {
        if(typeof obj[keys[i]] == 'object') {
          var set = obj[keys[i]];
          var table = '';
          for(var j = 0, total = set.length; j < total; j++) {
            table += '<tr>';
            for(var x = 0, fields = Object.keys(set[j]), fieldsTotal = fields.length; x < fieldsTotal; x++) {
              table += '<td>'+set[j][fields[x]]+'</td>';
            }
            table += '</tr>';
          }
          msg = msg.replace('%' + keys[i] + '%', table);
        } else {
          msg = msg.replace('%' + keys[i] + '%', obj[keys[i]]);
        }
      }
      return msg;
    });
  },
  capitalize: function(set, attr) {
    return set = set.map(function(obj) {
      obj[attr] = _.titleize(obj[attr]);
      return obj;
    });
  },
  monetize: function(value) {
    return humanize.numberFormat(value, 0, ',', '.');
  },
  setUrgency: function(object) {
    switch(object.urgency) {
      case 1: object.urgency = 'alta';
              break;
      case 2: object.urgency = 'media';
              break;
      case 3: object.urgency = 'baja';
              break;
    }
    return object;
  },
  setPaymentMethod: function(object) {
    switch(object.payment_method) {
      case 1: object.payment_method = 'Crédito';
              break;
      case 2: object.payment_method = 'Débito';
              break;
      case 3: object.payment_method = 'Efectivo';
              break;
    }
    return object;
  },
  fillSKU: function(sku) {
    sku = sku.toString();
    while(sku.length < 6) {
      sku = '0' + sku;
    }
    return sku;
  },
  dailySales: function(original) {
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
            time_date: temp.time_date
          }]
        };
        data.push(store);
      }
    }
    return data;
  },
  summarySales: function(original) {
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
    data.sales_amount = '$' + humanize.numberFormat(amount, 0, ',', '.');
    data.sales_products = products;
    data.sales_transactions = transactions;
    return data;
  },
  attachErrors: function(set, errors) {
    for(var i = 0, totalErrors = errors.length; i < totalErrors; i++) {
      for(var j = 0, totalSet = set.length; j < totalSet; j++) {
        if(errors[i].store_id == set[j].id) {
          set[j].errors_total = errors[i].errors;
        }
      }
    }
    return set;
  },
  countPayments: function(sales) {
    var counters = { credit: 0, debit: 0, cash: 0};
    for(var i = 0, total = sales.length; i < total; i++) {
      switch(sales[i].payment_method) {
        case 1: counters.credit++;
                break;
        case 2: counters.debit++;
                break;
        case 3: counters.cash++;
                break;
      }
    }
    return counters;
  },
  createChart: function(type, counters) {
    if(type == 'payments') {
      var pie = new Quiche('pie');
      pie.setTransparentBackground();
      pie.addData(counters.credit, 'Crédito', '8a83bb');
      pie.addData(counters.debit, 'Débito', '81b4bc');
      pie.addData(counters.cash, 'Efectivo', 'b681bc');
      return pie.getUrl(true);
    }
  }
};
