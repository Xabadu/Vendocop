var async = require('asyncawait/async');
var await = require('asyncawait/await');
var mailer = require('../lib/mailer');
var orm = require('../lib/orm');
var parser = require('../lib/parser');

var cash = {
  diff: async(function() {
    var diffs = [];
    await(orm.setLocale());
    stores = await(orm.getStores('exclude', [901, 902, 903]));
    stores.forEach(function(store) {
      var cassette = await(orm.getTwoLastCassettes(store.store_id));
      if(cassette[0].cassette !== cassette[1].cassette) {
        diffs.push({
          store_id: cassette[0].store_id,
          date_new: cassette[0].date_created,
          date_old: cassette[1].date_created,
          cassette_new: cassette[0].cassette,
          cassette_old: cassette[1].cassette
        });
      }
    });
    if(diffs.length > 0) {
      this.prepareMessages(diffs);
    }
    process.exit();
  }),
  prepareMessages: async(function(data) {
    data = parser.capitalize(data, 'date_new');
    data = parser.capitalize(data, 'date_old');
    this.sendMessages(parser.replaceContent(parser.getTemplateSync('cash'), data));
  }),
  sendMessages: function(messages) {
    if(messages.length > 0) {
      mailer.send('cashDifference', messages, errorHandler.sendMessages);
    } else {
      console.log('Emails sent');
    }
  },
};

cash.diff();
