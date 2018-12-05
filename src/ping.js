var async = require('asyncawait/async');
var await = require('asyncawait/await');
var orm = require('../lib/orm');
var parser = require('../lib/parser');

var pings = {
  check: async (function(vendor) {
    var maxTimeDiff, stores;
    if(typeof vendor !== 'undefined') {
      maxTimeDiff = 1500;
      stores = await (orm.getStores('exclude', [901, 902, 903], vendor));
    } else {
      maxTimeDiff = 16200;
      stores = await (orm.getStores('exclude', [1, 5, 6, 11, 901, 902, 903]));
    }
    stores.forEach(function(store) {
      var ping = await (orm.getLastPing(store.store_id));
      console.log('Last ping for store: ' + store);
      console.log(ping);
      var down = false;
      var now = new Date();
      console.log('Now date: ' + now);
      var parsedNow = parser.parseNow(now);
      console.log('Parsed now: ' + parsedNow);
      if(ping.length > 0) {
        var diff = parser.getTimeDifference(now, ping[0].created_at);
        console.log('Diff: ' + diff);
        if(diff > maxTimeDiff) {
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

pings.check(process.argv[2]);
