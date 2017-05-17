var http = require('http'); // http is a node module,creates instance of http object

http.createServer(function (req, res) { // createServer - creates event listener for any connection
  res.writeHead(200, {'Content-Type': 'text/plain'}); // Returns code 200 (ok)
  res.end('Hello World\n'); // Prints string and ends communication
}).listen(3000);

console.log('Server running at http://localhost:3000/'); // Writes on node.js cmd window