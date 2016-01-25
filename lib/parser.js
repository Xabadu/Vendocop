module.exports = {
  error: function(content, data) {
    var message = content.replace('%created_at%', data.error_created);
    message = message.replace('%store_name%', data.store_name);
    message = message.replace('%location_name%', data.location_name);
    message = message.replace('%error_name%', data.error_name);
    message = message.replace('%device_name%', data.device);
    message = message.replace('%urgency%', data.urgency);
    message = message.replace('%description%', data.description);
    return message;
  }
};
