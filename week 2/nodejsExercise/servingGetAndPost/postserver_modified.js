var http = require('http');
var url = require('url');
var querystring = require('querystring');
var mysql = require('mysql');




var server = http.createServer(function (request, response) {
    
    
    if (request.method == 'POST') {

        var connection = mysql.createConnection(
        {
          host     : '127.0.0.1',
          port     : '3306',
          user     : 'dan',
          password : 'charmander',
          database : 'learn'
        }
        );

        connection.connect();
        var body = '';
        request.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: request entity too large), kill request
            if (body.length > 1e6) {
                response.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                connection.end();
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            var POST = querystring.parse(body);
            console.log(POST);
            response.writeHead(200, {"Content-Type": "text/plain"});
            
            
            var firstName = "\"first_name\" = ( " + "\"" + POST.first_name + "\"" + " OR NULL )"
            var lastName = "\"last_name\" = ( " + "\"" + POST.last_name + "\"" + " OR NULL )"
            var gender = "\"gender\" = ( " + "\"" + POST.gender + "\"" + " OR NULL )"
            var query = connection.query('SELECT * FROM customer WHERE ' + firstName + " AND " + lastName + " AND " + gender);
            console.log(query)
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
            response.end('Hello ' + POST.first_name + ' '+ POST.last_name + ' ' + POST.gender + '\n');

            // now to get the different parameters use// POST.<field name> e.g. POST.user

            
        });


    }
    
});
// Listen on port 3000, IP defaults to 127.0.0.1 (localhost)
server.listen(3000);