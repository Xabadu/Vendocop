var mysql = require('mysql');
var Promise = require('promise');
var db = require('../config/db');

var orm = module.exports = {
  connection: mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database}),
  connect: function(connection) {
    return new Promise(function(resolve, reject){
      orm.connection.connect(function(err) {
        if(err) {
          reject(err);
        }
        resolve();
      });
    });
  },
  close: function(connection) {
    orm.connection.end();
  },
  setLocale: function() {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.setLocale, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve();
      });
    });
  },
  getActiveErrors: function() {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.getActiveErrors, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getDailyErrors: function() {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.getDailyErrors, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  acknowledgeErrors: function() {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.acknowledgeErrors, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getStores: function(action, values) {
    var condition = '';
    if(action === 'include') {
      condition = 'WHERE s.id IN ('+values.join(", ")+')';
    } else if(action === 'exclude') {
      condition = 'WHERE s.id NOT IN ('+values.join(", ")+')';
    }
    return new Promise(function(resolve, reject) {
      orm.connection.query(db.queries.getStores + condition, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getDailySales: function(store) {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.getDailySales, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getSummarySales: function() {
    return new Promise(function(resolve, reject) {
      orm.connection.query(db.queries.getSummarySales, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getSalesBenchmark: function(stores) {
    return new Promise(function(resolve, reject){
      orm.connection.query(db.queries.getTodaySales, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        var benchmark = results.map(function(record) {
          var obj = {
            store_id: record.store_id,
            sales: [record.suma]
          };
          return obj;
        });
        for(var i = 0, sTotal = stores.length; i < sTotal; i++) {
          var exists = false;
          for(var j = 0, bTotal = benchmark.length; j < bTotal; j++) {
            if(stores[i].store_id == benchmark[j].store_id) {
              exists = true;
            }
          }
          if(!exists) {
            benchmark.push({store_id: stores[i].store_id, sales: [0]});
          }
        }
        orm.connection.query(db.queries.getWeekAgoSales, function(error, results, fields) {
          if(error) {
            reject(error);
          }
          benchmark = orm.addBenchmarkData(results, benchmark, 2);
          orm.connection.query(db.queries.getTwoWeeksAgoSales, function(error, results, fields) {
            if(error) {
              reject(error);
            }
            benchmark = orm.addBenchmarkData(results, benchmark, 3);
            orm.connection.query(db.queries.getThreeWeeksAgoSales, function(error, results, fields) {
              if(error) {
                reject(error);
              }
              benchmark = orm.addBenchmarkData(results, benchmark, 4);
              resolve(benchmark);
            });
          });
        });
      });
    });
  },
  addBenchmarkData: function(data, benchmark, round) {
    for(var i = 0, dTotal = data.length; i < dTotal; i++) {
      for(var j = 0, bTotal = benchmark.length; j < bTotal; j++) {
        if(data[i].store_id == benchmark[j].store_id) {
          benchmark[j].sales.push(data[i].suma);
        }
      }
    }
    benchmark = benchmark.map(function(b) {
      if(b.sales.length < round) {
        b.sales.push(0);
      }
      return b;
    });
    return benchmark;
  },
  getLastPing: function(store) {
    var query = db.queries.getLastPing;
    query = query.replace('%store_id%', store);
    return new Promise(function(resolve, reject) {
      orm.connection.query(query, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  insertError: function(store_id, error_id, created_at) {
    var query = db.queries.insertError;
    query = query.replace('%store_id%', store_id);
    query = query.replace('%error_id%', error_id);
    query = query.replace('%created_at%', created_at);
    console.log(query);
    return new Promise(function(resolve, reject) {
      orm.connection.query(query, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  }
};
