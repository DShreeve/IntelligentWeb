/**
 * Created by fabio on 18/02/15.
 */
var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var mysql = require('mysql');


var file = new (static.Server)();
var portNo = 3000;
var app = protocol.createServer(function (req, res) {
    var pathname = url.parse(req.url).pathname;
    if ((req.method == 'POST') && (pathname == '/postFile.html')) {
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
        req.on('data', function (data) {
            body += data;
            // if body >  1e6 === 1 * Math.pow(10, 6) ~~~ 1MB
            // flood attack or faulty client
            // (code 413: req entity too large), kill req
            if (body.length > 1e6) {
                res.writeHead(413,
                    {'Content-Type': 'text/plain'}).end();
                connection.end();
                req.connection.destroy();
            }
        });
        req.on('end', function () {
            var serialData = JSON.parse(body);

            var columns = [];
            var values = [];
            for ( var key in serialData) {
                columns.push(key);
                values.push(serialData[key]);
            };

            var query = connection.query('INSERT INTO customer ' + columns + " VALUES " + values );

            query.on('error', function(err) {
                throw err;
            });

            console.log(query.insertId);
            serialData["number"] = query.insertId;
            var returnString = "{" ;
            var concatString ="\'id\': " ;

            count = 0;
            last = Object.keys(serialData).length
            for (var key in serialData ) {
                count += 1
                columns += key
                returnString += "\'"+key+"\':\'"+serialData[key]+'\''
                concatString += key
                if (count < last){
                    returnString += ", ";
                    concatString += "_";
                } else {
                    returnString += concatString+"}";
                }

            }


            res.writeHead(200, {"Content-Type": "text/plain"});

            connection.end();
            res.end(returnString);
        });
    }

    else {
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
                res.writeHead(200, {"Content-Type": "text/plain", 'Access-Control-Allow-Origin': '*'});

            }
        });
    }
}).listen(portNo);