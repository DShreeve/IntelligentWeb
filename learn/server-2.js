var http = require('http'); // http is a node module,creates instance of http object
var url = require('url');

var server = http.createServer(function (request, response) { // createServer - creates event listener for any connection
  if (request.method == 'GET') {
    var queryData = url.parse(request.url, true).query;
    response.writeHead(200, {"Content-Type": "text/plain"});
    // if parameter is provided
    if (queryData.name) {
      response.end("Hello " + queryData.name + "\n");
    } else {
      response.end("Hello World\n")
    }
  }
});

server.listen(3000);

console.log('Server running at http://localhost:3000/'); // Writes on node.js cmd window