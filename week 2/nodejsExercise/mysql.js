var mysql = require('mysql');

var connection = mysql.createConnection(
    {
      host     : 'localhost',
      port     : '3306',
      user     : 'dan',
      password : 'charmander',
      database : 'learn'
    }
);
connection.connect();
var query = connection.query('SELECT * FROM customer');

query.on('error', function(err) {
    throw err;
});

query.on('fields', function(fields) {
    console.log(fields);
});

query.on('result', function(row) {
    console.log(row);
});
connection.end();