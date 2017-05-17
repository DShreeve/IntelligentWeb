var http = require('http'); // http is a node module,creates instance of http object
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function (request, response) { // createServer - creates event listener for any connection
  if (request.method == 'POST') {
    var body = '' ;
    request.on('data', function (data) {
      body += data ;
      // if body > 1e6 ===1 *Math.pow(10, 6) ~~~ 1MB
      // flood attack or faulty client
      // (code 413: request entity too large), kill request
      if (body.length > 1e6){
        response.writeHead(413,
          {'Content-Type': 'text/plain'}).end();
        request.connection.destroy();
      }
    });
    request.on('end',function(){
      var POST = querystring.parse(body);
      // Access paramas. POST.<field name>
    });
  };
});

server.listen(3000);

console.log('Server running at http://localhost:3000/'); // Writes on node.js cmd window