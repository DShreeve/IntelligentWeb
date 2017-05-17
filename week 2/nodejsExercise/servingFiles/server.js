/**
 * Created by fabio on 18/02/15.
 */
var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');

var file = new (static.Server)();
var portNo = 3001;
var app = protocol.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;
    if (pathname == '/virtualfile.html') {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end('{wow: "wow"}');
    }
    else
        file.serve(req, res, function (err, result) {
            if (err != null) {
                console.error('Error serving %s - %s', req.url, err.message);
                if (err.status === 404 || err.status === 500) {
                    file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
                } else {
                    res.writeHead(err.status, err.headers);
                    res.end();
                }
            } else {
                console.log('serving %s (err: %s)', req.url, err);
            }
        });
}).listen(portNo);