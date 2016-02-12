var mailer = require('../lib/mailer');
var orm = require('../lib/orm');
var parser = require('../lib/parser');

var salesReporter = {
  getStores: function(type) {
    orm.connect()
      .then(orm.setLocale)
      .then(function() {
        if(type == 'individual') {
          salesReporter.getIndividualSales();
        } else if(type == 'summary') {
          salesReporter.getSummaryData();
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  getIndividualSales: function() {
    orm.getDailySales()
      .then(function(results) {
        var dailySales = parser.dailySales(results);
        dailySales = parser.capitalize(dailySales, 'today');
        dailySales = dailySales.map(function(st) {
          st.sales_total = '$' + parser.monetize(st.sales_total);
          st.counters = parser.countPayments(st.sales);
          return st;
        });
        salesReporter.prepareMessage(dailySales, 'sales-individual');
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  getSummaryData: function() {
    orm.getSummarySales()
      .then(function(results) {
        results = parser.capitalize(results, 'today');
        var summarySales = parser.summarySales(results);
        var ids = summarySales.sales.map(function(sale) {
          return sale.id;
        });
        orm.getStores('exclude', ids)
          .then(function(stores) {
            for(var i = 0, total = stores.length; i < total; i++) {
              var store = {
                store_name: stores[i].store_name,
                store_location: stores[i].store_location,
                sales_total: 0,
                sales_amount: 0,
                errors_total: '-'
              };
              summarySales.sales.push(store);
            }
            salesReporter.getErrors(summarySales, 'sales-summary');
          })
          .catch(function(error){
            console.log(error);
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  getErrors: function(data, template) {
    orm.getDailyErrors()
      .then(function(errors) {
        if(errors.length > 0) {
          data.sales = parser.attachErrors(data.sales, errors);
          salesReporter.prepareMessage(data, template);
        } else {
          salesReporter.prepareMessage(data, template);
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  prepareMessage: function(data, template) {
    var storesInfo = [];
    if(template == 'sales-individual') {
      data = data.map(function(store) {
        store.sales = store.sales.map(function(sale) {
            sale.sales_sku = parser.fillSKU(sale.sales_sku);
            sale.sales_price = '$' + parser.monetize(sale.sales_price);
            sale.sales_total = '$' + parser.monetize(sale.sales_total);
            sale = parser.setPaymentMethod(sale);
            return sale;
        });
        store.payments_chart = parser.createChart('payments', store.counters);
        return store;
      });
      storesInfo = data.map(function(store) {
        return store.store_name + ' ' + store.store_location;
      });
    } else if(template == 'sales-summary') {
      data.sales = data.sales.map(function(sale) {
        delete sale.today;
        delete sale.id;
        delete sale.products_total;
        sale.store_name += ' ' + sale.store_location;
        delete sale.store_location;
        sale.sales_amount = '$' + parser.monetize(sale.sales_amount);
        sale.errors_total = '-';
        return sale;
      });
      data = [data];
    }

    var messages = [];
    var type = template;
    parser.getTemplate(template)
      .then(function(template) {
        messages = parser.replaceContent(template, data);
        salesReporter.sendMessages(messages, type, storesInfo);
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  sendMessages: function(messages, type, stores) {
    if(messages.length > 0) {
      if(type == 'sales-individual' || type == 'salesIndividual') {
        var override = {
          subject: 'Reporte de ventas diarias ' + stores.shift()
        };
        mailer.send('salesIndividual', messages, salesReporter.sendMessages, override, stores);
      } else {
        mailer.send('salesSummary', messages, salesReporter.sendMessages);
      }
    } else {
      console.log('Emails sent');
      orm.close();
      process.exit();
    }
  }
};

salesReporter.getStores(process.argv[2]);
