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
  }
};
