var async = require('asyncawait/async');
var await = require('asyncawait/await');
var orm = require('../lib/orm');
var parser = require('../lib/parser');

var pings = {
  check: async (function() {
    var stores = await (orm.getStores());
    stores.forEach(function(store) {
      var ping = await (orm.getLastPing(store.store_id));
      var down = false;
      var now = new Date();
      var parsedNow = parser.parseNow(now);
      if(ping.length > 0) {
        if(parser.getTimeDifference(now, ping[0].created_at) > 4200) {
          down = true;
        }
      }
      if(down) {
        await (orm.insertError(store.store_id, 901, parsedNow));
        console.log('Error agregado a la máquina ' + store.store_id);
      }
      await (orm.cleanPings(store.store_id));
      console.log('Pings antiguos han sido eliminados.');
    });
    process.exit();
  })
};

pings.check();
