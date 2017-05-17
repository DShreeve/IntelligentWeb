var mysql = require('mysql');

var connection = mysql.createConnection(
  {
    host: ,
    port: ,
    user: ,
    password: ,
    database:
  }
);

connection.connect();

var queryString = 'SELECT * FROM your_relation';

// Process's all data when all data is recieved
connection.query(queryString, // Callback func, called when resulsts recieved
  function(err, rows, fields) {
    if (err) throw err;
    for ( var i in rows) {
      console.log("Name: " + rows[i].name + " ", rows[i].surName);
    };
  };
);
connection.end();