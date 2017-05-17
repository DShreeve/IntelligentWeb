/**
 * Created by fabio on 18/02/15.
 */
var request = require('request');

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

// Configure the request
var options = {
    // localhost does not work if you run from localhost the server itself
    url: 'http://localhost',
    method: 'GET',
    headers: headers,
    qs: {'name': 'xxx', 'key2': 'yyy'}
}

// Start the request
request(options,
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
})