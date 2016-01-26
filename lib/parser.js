var fs = require('fs');

module.exports = {
  template: function(data, template, connection, callback) {
    var message = '';
    var keys = Object.keys(data);
    fs.readFile('./resources/templates/'+template+'.html', 'utf8', function(err, html) {
      message = html;
      for(var i = 0, length = keys.length; i < length; i++) {
        message = message.replace('%' + keys[i] + '%', data[keys[i]]);
      }
      callback(data, message, connection);
    });
  }
};
