var mailer = require('../lib/mailer');
var parser = require('../lib/parser');
var orm = require('../lib/orm');

var errorHandler = {
  getData: function() {
    orm.connect()
       .then(orm.setLocale)
       .then(orm.getActiveErrors)
       .then(function(results) {
         console.log('Total errors found: ' + results.length);
         results = results.map(parser.setUrgency);
         errorHandler.prepareMessage(results);
       })
       .catch(function(error) {
         console.log(error);
       });
  },
  prepareMessage: function(data) {
    var messages = [];
    data = parser.capitalize(data, 'date_created');
    parser.getTemplate('error')
      .then(function(template) {
        messages = parser.replaceContent(template, data);
        errorHandler.sendMessages(messages);
      })
      .catch(function(error) {
        console.log(error);
      });
  },
  sendMessages: function(messages) {
    if(messages.length > 0) {
      mailer.send('error', messages, errorHandler.sendMessages);
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

errorHandler.getData();
