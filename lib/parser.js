module.exports = {
  error: function(content, data) {
    var message = content;
    var keys = Object.keys(data);
    for(var i = 0, length = keys.length; i < length; i++) {
      message = message.replace('%' + keys[i] + '%', data[keys[i]]);
    }
    return message;
  }
};
