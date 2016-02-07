var mysql = require('mysql');
var Promise = require('promise');
var db = require('../config/db');

module.exports = {
  connection: mysql.createConnection({host: db.host, user: db.user, password: db.password, database: db.database}),
  connect: function(connection) {
    return new Promise(function(resolve, reject){
      connection.connect(function(err) {
        if(err) {
          reject(err);
        }
        resolve(connection);
      });
    });
  },
  close: function(connection) {
    connection.end();
    process.exit();
  },
  setLocale: function(connection) {
    return new Promise(function(resolve, reject){
      connection.query(db.setLocaleQuery, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(connection);
      });
    });
  },
  getActiveErrors: function(connection) {
    return new Promise(function(resolve, reject){
      connection.query(db.errorsQuery, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  acknowledgeErrors: function(connection) {
    return new Promise(function(resolve, reject){
      connection.query(db.updateErrorsQuery, function(error, results, fields) {
        if(error) {
          reject(error);
        }
        resolve(results);
      });
    });
  },
  getStores: function() {

  },
  getDailySales: function() {

  },
  getSummarySales: function() {

  }
};
