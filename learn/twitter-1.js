var Twit = require('twit');

var client = new Twit({
  consumer_key: 'EOHirXZU4yCQ2LZqKeDRcq6VP',
  consumer_secret: 'QBcO7smz2IA0MSq82tLRWkIhiPaYl4A9w3jzWTb5ZAwfLv0cio',
  access_token: '319135264-2jYrbhEaZBMh5tgPGD5RZ8AHMUSPMfXflvEkCRN6',
  access_token_secret: 'm9tpRt81pydSDh91jiobr4DzUaKjxwTaU2R6YcJpcVcD5'
});

// tweet 'hello world!'
client.post('statuses/update', { status: "Hello world!"}, function(err, data, response) {console.log(data)});

// search twitter for all tweets containing the word 'banana' since 11/11/2006
client.get('search/tweets', { q: "banana since:2016-11-11", count: 1}, 
  function(err, data, response) {console.log(data)});