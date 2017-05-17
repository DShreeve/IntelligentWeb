var mysql = require('mysql') ;

var connection = mysql.createConnection(
  {
    host: ,
    user: ,
    password: ,
    database: 
  }
)

connection.connect();
var query = connection.query('SELECT * FROM your_relation');

query.on('error', function(err) {
  throw err;
});

query.on('fields', function(fields) {
  console.log(fields);
})

query.on('result', function(row) {
  console.log("Name: "+ row.name + ' ', row.surName);
});

connection.end();