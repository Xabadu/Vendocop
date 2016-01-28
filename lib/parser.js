var fs = require('fs');
var _ = require('lodash');

module.exports = {
  template: function(data, template, connection, callback) {
    var message = '';
    var keys = Object.keys(data);
    fs.readFile('./resources/templates/'+template+'.html', 'utf8', function(err, html) {
      message = html;
      if(template == 'error') {
        data.date_created = _.capitalize(data.date_created);
      }
      for(var i = 0, length = keys.length; i < length; i++) {
        message = message.replace('%' + keys[i] + '%', data[keys[i]]);
      }/*
      if(template === 'sales-individual') {

      }*/
      callback(data, message, connection);
    });
  }
};
