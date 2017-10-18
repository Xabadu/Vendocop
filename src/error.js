var async = require('asyncawait/async');
var await = require('asyncawait/await');
var mailer = require('../lib/mailer');
var parser = require('../lib/parser');
var orm = require('../lib/orm');

var errorHandler = {
  getData: async(function(vendor) {
    var errors;
    await(orm.connect());
    errors = await(orm.getActiveErrors(vendor));
    console.log('Total errors found: ' + errors.length);
    if(errors.length > 0) {
      errors = errors.map(parser.setUrgency);
      errorHandler.prepareMessage(errors, vendor);
    } else {
      process.exit();
    }
  }),
  prepareMessage: function(data, vendor) {
    var messages = [];
    data = parser.capitalize(data, 'date_created');
    parser.getTemplate('error')
      .then(function(template) {
        messages = parser.replaceContent(template, data);
        errorHandler.sendMessages(messages, vendor);
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  sendMessages: function(messages, vendor) {
    var type = typeof vendor !== 'undefined' ? 'error' + vendor : 'error';
    if(messages.length > 0) {
      mailer.send(type, messages, errorHandler.sendMessages);
    } else {
      console.log('Emails sent');
      errorHandler.updateData();
    }
  },
  updateData: function() {
    orm.acknowledgeErrors()
      .then(function() {
        console.log('Data updated');
        process.exit();
      })
      .catch(function(error) {
        console.log(error);
      });
  }
};

errorHandler.getData(process.argv[2]);
