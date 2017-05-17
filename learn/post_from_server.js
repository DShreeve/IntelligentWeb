var request = require('request');

// Set the headers
var headers = {
  'User-Agent': 'Super Agent/0.0.1'
  'Content-Type': 'application/x-www-form-urlencoded' //HTTP header
};

// Configure the request
var options = {
  url: 'http://samwize.com',
  method: 'POST',
  headers: headers,
  form: {'key1': 'xxx', 'key2': 'yyy'} // Parameters for the POST
}

// Start the request
request(options,
  function (error, response, body) {
    if (!error && response.statuscode == 200){
      // Print out the response body
      console.log(body)
    };
  };
);