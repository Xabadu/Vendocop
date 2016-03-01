var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var expect = require('chai').expect;
var parser = require('../lib/parser');

chai.use(chaiAsPromised);

describe('Parser', function() {

  describe('#getTemplate()', function() {
    it('should open return a html file if the file param is correct', function(done) {
      expect(parser.getTemplate('error')).to.eventually.be.a('string').notify(done);
    });
    it('should return an error when file param is empty', function(done) {
      expect(parser.getTemplate('')).to.be.rejected.notify(done);
    });
    it('should return an error when file param is invalid', function(done) {
      expect(parser.getTemplate('vendocop')).to.be.rejected.notify(done);
    });
  });

  describe('#replaceContent()', function() {
    it('should replace keys in string with input data and return an array', function() {
      var inputData = [{
        name: 'John Cena',
        age: 35
      }];
      var message = '%name% is %age%';
      expect(parser.replaceContent(message, inputData)).to.be.a('array');
      expect(parser.replaceContent(message, inputData)[0]).to.equal('John Cena is 35');
    });
    it('should return a table if input data contains an array', function() {
      var inputData = [{
        characters: [{name: 'Batman'},{name: 'Deadpool'},{name: 'John Cena'}]
      }];
      var message = '%characters%';
      message = parser.replaceContent(message, inputData);
      expect(message).to.be.a('array');
      expect(message).to.have.length.of.at.least(1);
      expect(message[0]).to.be.a('string');
      expect(message[0]).to.contain('<tr><td>'+inputData[0].characters[0].name+'</td></tr>');
    });

  });

  describe('#capitalize()', function() {
    it('should return an array of capitalized words', function() {
      var words = [
        { name: 'batman' },
        { name: 'deadpool' },
        { name: 'john cena' }
      ];
      words = parser.capitalize(words, 'name');
      expect(words[0].name).to.equal('Batman');
      expect(words[1].name).to.equal('Deadpool');
      expect(words[2].name).to.equal('John Cena');
    });
  });

  describe('#monetize()', function() {
    it('should return a money formatted number', function() {
      var number = 8250;
      var money = parser.monetize(number);
      expect(money).to.be.a('string');
      expect(money).to.equal('8.250');
    });
  });

  describe('#setUrgency()', function() {
    it('should map numbers to urgency levels', function() {
      var urgencies = [{urgency: 1}, {urgency: 2}, {urgency: 3}];
      urgencies = urgencies.map(function(urgency) {
        return parser.setUrgency(urgency);
      });
      expect(urgencies[0].urgency).to.be.a('string');
      expect(urgencies[1].urgency).to.be.a('string');
      expect(urgencies[2].urgency).to.be.a('string');
      expect(urgencies[0].urgency).to.equal('alta');
      expect(urgencies[1].urgency).to.equal('media');
      expect(urgencies[2].urgency).to.equal('baja');
    });
  });

  describe('#setPaymentMethod()', function() {
    it('should map numbers to payment methods', function() {
      var payments = [{payment_method: 1}, {payment_method: 2}, {payment_method: 3}];
      payments = payments.map(function(payment) {
        return parser.setPaymentMethod(payment);
      });
      expect(payments[0].payment_method).to.be.a('string');
      expect(payments[1].payment_method).to.be.a('string');
      expect(payments[2].payment_method).to.be.a('string');
      expect(payments[0].payment_method).to.equal('Débito');
      expect(payments[1].payment_method).to.equal('Crédito');
      expect(payments[2].payment_method).to.equal('Efectivo');
    });
  });

  describe('#fillSKU()', function() {
    it('should return Empty SKU if the product id is empty', function() {
      var sku = parser.fillSKU(null);
      expect(sku).to.equal('Empty SKU');
    });
    it('should fill with zeros the original product ids until it completes 6 digits', function() {
      var ids = [123, 22, 6];
      ids = ids.map(function(id) {
        return parser.fillSKU(id);
      });
      expect(ids[0]).to.be.a('string');
      expect(ids[1]).to.be.a('string');
      expect(ids[2]).to.be.a('string');
      expect(ids[0]).to.have.length(6);
      expect(ids[1]).to.have.length(6);
      expect(ids[2]).to.have.length(6);
      expect(ids[0]).to.equal('000123');
      expect(ids[1]).to.equal('000022');
      expect(ids[2]).to.equal('000006');
    });
  });

  describe('#dailySales()', function() {
    it('should return an array of parsed sales data from an array of sales objects', function() {
      var input = [{
        store_id: 3,
        today: 'Saturday, 20 February, 2016',
        store_name: 'Store',
        store_location: 'Planet Earth',
        store_metadata: 'Exit 1',
        sales_sku: 39,
        sales_product_name: 'Product 1',
        sales_price: 1000.00,
        sales_quantity: 1,
        payment_method: 3,
        time_date: '10:22:00'
      }, {
        store_id: 3,
        today: 'Saturday, 20 February, 2016',
        store_name: 'Store',
        store_location: 'Planet Earth',
        store_metadata: 'Exit 1',
        sales_sku: 40,
        sales_product_name: 'Product 1',
        sales_price: 2000.00,
        sales_quantity: 2,
        payment_method: 1,
        time_date: '10:22:00'
      } ,{
        store_id: 4,
        today: 'Saturday, 20 February, 2016',
        store_name: 'Store 2',
        store_location: 'Planet Earth',
        store_metadata: 'Exit 2',
        sales_sku: 39,
        sales_product_name: 'Product 2',
        sales_price: 2000.00,
        sales_quantity: 2,
        payment_method: 2,
        time_date: '10:22:00'
      },];
      var parsedData = parser.dailySales(input);
      expect(parsedData).to.be.a('array');
      expect(parsedData[0]).to.be.a('object');
      expect(parsedData[0].sales).to.be.a('array');
      expect(parsedData).to.have.length(2);
      expect(parsedData[0].sales).to.have.length(2);
    });
  });

  describe('#summarySales()', function() {
    it('should return an array of parsed summarized sales data from an array of sales objects', function() {
      var input = [{
        today: 'Saturday, 20 February, 2016',
        id: 3,
        store_name: 'Store',
        store_location: 'Planet Earth',
        sales_total: 2,
        sales_amount: 2000,
        products_total: 2
      }, {
        today: 'Saturday, 20 February, 2016',
        id: 5,
        store_name: 'Store 2',
        store_location: 'Planet Earth 2',
        sales_total: 1,
        sales_amount: 1000,
        products_total: 1
      }];
      var parsedData = parser.summarySales(input);
      expect(parsedData).to.be.a('object');
    });
  });

  describe('#attachErrors()', function() {
    it('should return an object with an errors_total attribute', function() {
      var input = [{
        today: 'Saturday, 20 February, 2016',
        id: 3,
        store_name: 'Store',
        store_location: 'Planet Earth',
        sales_total: 2,
        sales_amount: 2000,
        products_total: 2
      }, {
        today: 'Saturday, 20 February, 2016',
        id: 5,
        store_name: 'Store 2',
        store_location: 'Planet Earth 2',
        sales_total: 1,
        sales_amount: 1000,
        products_total: 1
      }];
      var errors = [{
        store_id: 3,
        errors: 4
      }, {
        store_id: 5,
        errors: 2
      }];
      var parsedData = parser.summarySales(input);
      parsedData.sales = parser.attachErrors(parsedData.sales, errors);
      expect(parsedData.sales[0].errors_total).to.be.a('number');
      expect(parsedData.sales[0].errors_total).to.equal(4);
      expect(parsedData.sales[1].errors_total).to.be.a('number');
      expect(parsedData.sales[1].errors_total).to.equal(2);
    });
  });

  describe('#countPayments()', function() {
    it('should return a counter with different type of payments accumulated', function() {
      var sales = [{payment_method: 1}, {payment_method: 1}, {payment_method: 2}, {payment_method: 3}];
      var counters = parser.countPayments(sales);
      expect(counters).to.be.a('object');
      expect(counters.debit).to.equal(2);
      expect(counters.credit).to.equal(1);
      expect(counters.cash).to.equal(1);
    });
  });

  describe('#createChart()', function() {
    it('should return a pie chart for payments data', function() {
      var payments = { credit: 15, debit: 10, cash: 50};
      var chart = parser.createChart('payments', payments);
      expect(chart).to.be.a('string');
      expect(chart).to.contain('http');
    });
    it('should return a bar chart for benchmark data', function() {
      var benchmark = {sales: [10000, 20000, 0, 35000]};
      var chart = parser.createChart('benchmark', benchmark);
      expect(chart).to.be.a('string');
      expect(chart).to.contain('http');
    });
    it('should return false if not a valid chart type', function() {
      var chart = parser.createChart('invalidChart', null);
      expect(chart).to.be.false;
    });
  });

  describe('#getTimeDifference()', function() {
    it('should return the difference in seconds between two input dates', function() {
      var then = new Date();
      var now = new Date();
      var expectedDiff = (now.getTime() - then.getTime()) / 1000;
      var actualDiff = parser.getTimeDifference(now, then);
      expect(actualDiff).to.equal(expectedDiff);
      expect(actualDiff).to.be.a('number');
    });
  });

  describe('#parseNow()', function() {
    it('should return a YYYY-mm-dd H:i:s parsed date from a Date object input', function() {
      var now = new Date();
      var parsedNow = parser.parseNow(now);
      expect(parsedNow).to.be.a('string');
      expect(parsedNow).to.have.length(19);
      expect(parsedNow).to.contain(':');
    });
    it('should add leading zeros to days, months, hours, minutes and seconds lower than 10', function() {
      var now = new Date();
      now.setDate(1);
      now.setMonth(2);
      now.setHours(3);
      now.setMinutes(4);
      now.setSeconds(5);
      var parsedNow = parser.parseNow(now);
      expect(parsedNow).to.equal('2016-03-01 03:04:05');
    });
    it('should not add anything to days, months, hours, minutes and seconds higher than 10', function() {
      var now = new Date();
      now.setDate(11);
      now.setMonth(11);
      now.setHours(13);
      now.setMinutes(14);
      now.setSeconds(15);
      var parsedNow = parser.parseNow(now);
      expect(parsedNow).to.equal('2016-12-11 13:14:15');
    });
  });

});
