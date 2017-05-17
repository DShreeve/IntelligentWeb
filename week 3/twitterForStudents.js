/**
 * Created by fabio on 26/02/15.
 */
var Twit = require('twit');
var client = new Twit({
  consumer_key: 'EOHirXZU4yCQ2LZqKeDRcq6VP',
  consumer_secret: 'QBcO7smz2IA0MSq82tLRWkIhiPaYl4A9w3jzWTb5ZAwfLv0cio',
  access_token: '319135264-2jYrbhEaZBMh5tgPGD5RZ8AHMUSPMfXflvEkCRN6',
  access_token_secret: 'm9tpRt81pydSDh91jiobr4DzUaKjxwTaU2R6YcJpcVcD5'
});


//  search twitter for all tweets containing the word 'banana'
// since Nov. 11, 2011
client.get('search/tweets', {q: "banana OR choclate AND strawberry OR cream" , count: 100, since:2000-01-01 },
            function(err, data, response) {
                console.log(data);
                for (var indx in data.statuses) {
                    var tweet= data.statuses[indx];
                    console.log('on: ' + tweet.created_at + ' : @' + tweet.user.screen_name + ' : ' + tweet.text+'\n\n');
                }

            })