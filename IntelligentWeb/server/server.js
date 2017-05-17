
var mysql = require('mysql');
var connection = getConnection();
var Twit = require('twit');
var utf8 = require('utf8');

var protocol = require('http');
var static = require('node-static');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

console.log("dasd")

var file = new (static.Server)();
var portNo = 3000;

var app = protocol.createServer(function (req, res) {
    console.log("dasd")
    var pathname = url.parse(req.url).pathname;
    if ((req.method == 'POST') && (pathname == '/home.html')) {
        
        var connection = getConnection();
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
            console.log(body);
            console.log("=#=#=#=#=#=#===#==#=#=#=#=#==#=#=#=##==#=#=#=#=#=##==#=#");
            console.log(JSON.parse(body));
            var serialData = JSON.parse(body);
            console.log(serialData);
            userQuery(serialData,connection, function(tweets){
                res.writeHead(200, {"Content-Type": "text/plain"});

                connection.end();
                res.end();
            });



            
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

// var hash = {} ;

// hash["player"] = ["#goal"]; //, "David Seaman", "Michael Owem", "@AlanSmith"
// hash["team"] = [] //,"Chelsea", "@LUFC"
// connection.connect();

// console.log(totalElementsInArrayHash(hash));
// // getQueryId(hash,connection,function(id){
//     console.log("PPPPRRROOOOGRESSS:      ->  "+ id)

// })
// getQueryId(hash, connection, function(queryId) {
//     queryTwitter( queryId, null, connection)
// })
// queryTwitter( 1, null, connection, function(tweets){
//     var tweet_ids = []
//     console.log("tweets length" + ":  "+ tweets.statuses.length)
//     for ( var i in tweets.statuses) {
//         //console.log(tweets[i]);
//         getTweetId(tweets.statuses[i],connection, function(tweetId) {
//             tweet_ids.push(tweetId);
//             if (tweet_ids.length == tweets.statuses.length) {
//                 console.log(tweet_ids);
//             }
//         })
//     }

// })



function userQuery( hash, connection, callback ) {
    getQueryId(hash, connection, function(id){
        executeQuery(id, connection, function(tweets){
            callback(tweets);
        })
    })
} 

function newTweets( queryId, date, connection, callback){
    var tweet_ids = []
    queryTwitter( queryId, null, connection, function(tweets){
        console.log("tweets length" + ":  "+ tweets.statuses.length)
        for ( var i in tweets.statuses) {
            //console.log(tweets[i]);
            getTweetId(tweets.statuses[i],connection, function(tweetId) {
                tweet_ids.push(tweetId);
                if (tweet_ids.length == tweets.statuses.length) {
                    callback(tweet_ids);
                }
            })
        }

    })
}


function executeQuery( id, connection, callback) {
    internalTweets(id, connection, function(internalTweets){
        
        newTweets(id, null, connection, function(externalTweets){
            callback(internalTweets.concat(externalTweets));
        } )
    })
    //query witter

}

function internalTweets(queryId, connection, callback) {
    var tweetIds = [] ;
    var statement = "SELECT * FROM query_tweet where query = ?"
    var query = connection.query(statement, queryId , function(error, result, field){
        if (result.length > 0 ) {
            for (var i in result) {
                tweetIds.push(result[i].tweet)
                if ( i < (result.length - 1) ) {
                    callback(tweetIds);
                }
            }
        } else {
            callback(tweetIds);
        }
        
    })
}

function getQueryId( hash, connection, callback) {
    getQueriesInCommon( hash, connection, function(common){
        console.log("query in common :" +common)
        var count = 0 ;
        if (common.length < 1){
            createQuery(hash, connection, function(id){
                callback(id);
            })
        }
        for ( var i in common){
            //console.log("Hi "+ i)
            getQueryTermCount(common[i], connection,function(id,amount){
                //console.log(amount);
                count += 1 ; 
                if(totalElementsInArrayHash(hash)==amount){
                    callback(id)
                } else if ( count > (common.length -1)) {
                    // last, no match
                    createQuery(hash, connection, function(id){
                        callback(id);
                    })
                }
            })
        }

    })
}

function createQuery( hash, connection, callback){
    console.log("createQuery called");
    var query = connection.query("INSERT INTO query () VALUES ()", function(error, result, field) {
        attachQueryTerms(result.insertId, hash, connection, function(finished){
            if (finished){
                callback(result.insertId)
            }
        })


    });
}

function attachQueryTerms( id, hash, connection, callback){
    var count = 0 ;
    var hashValues = totalElementsInArrayHash(hash) ;
    var statement = "INSERT INTO query_term (query, term) VALUES (?,?)"
    getTermIds(hash,connection, function(termIds) {
        for (var type in termIds) {
            for (var term in termIds[type]){
                var query = connection.query(statement ,[id, termIds[type][term]], function(err, result, field){
                    count += 1;
                    if ( hashValues == count) {
                        console.log("Finished adding term query association")
                        callback(true);
                    }
                })
            }
        }

    }) ;
}


function getQueryTermCount( id, connection, callback){
    var statement = "SELECT * FROM query_term WHERE query = ?"
    var query = connection.query(statement , [id], function(error, result, field){
        callback(id, result.length)
    })
}

function getQueriesInCommon( hash, connection, callback){
    var common =[] ;
    var first = true ;
    var count = 0 ;
    getTermIds(hash, connection, function(terms){
        for ( var type in terms) {
            for (var term in terms[type]){

                getTermQueries(terms[type][term], connection,function(termId,queries){
                    count += 1;
                    //console.log(termId+" is in "+queries);
                    if (first) {
                        first = false ;
                        common = common.concat(queries) ;
                    } else {
                        common = arrayIntersect(common, queries)
                    }
                    if (count == totalElementsInArrayHash(hash)){
                        //console.log("q in common complete")
                        callback(common)
                    }
                    


                })
            } 
        }        
    })
}

function totalElementsInArrayHash(hash){
    var amount = 0 ;
    for (var key in hash){
        for (var index in hash[key]){
            amount += 1 ;
        }
    }
    return amount ;
}


function getTermIds( hash, connection, callback) {
    var termIds ={}
    for (var type in hash ) {   
        termIds[type] = [] ;
        //console.log(termIds);    
        for ( var index in hash[type]){
        //console.log(hash[type][index]);
        termExists(hash[type][index], type, connection,function(exists, pName, pType){
            if (exists){
                //console.log("Exists");
                getTermId(pName, pType,connection,function(id){
                    //console.log(pName + " exists with id: "+id);
                    termIds[pType].push(id);
                    if (sameSizeHash(hash,termIds)) {
                        //console.log("Final Hash = "+termIds);
                        callback(termIds);
                    };
                });
            } else {
                insertTerm(pName, pType,connection, function(id) {
                    //console.log(pName + " created with id: "+ id);
                    termIds[pType].push(id);
                    if (sameSizeHash(hash,termIds)) {
                        //console.log("Final hash = "+termIds);
                        callback(termIds);
                    };
                });
            };
        });
        }
    }
}

function sameSizeHash(  hash1, hash2 ){
    var count = 0 ;
    if (Object.keys(hash1).length == Object.keys(hash2).length){        
        //console.log("count: "+count);
        for (var key in hash1){
        count += 1 ;
            if ( key in hash2 ) {
                if (hash1[key].length == hash2[key].length){
                    if ( !(count < Object.keys(hash1).length) ) {
                        //console.log("Match")
                        return true
                    }
                } else {
                    // Nothing, Carry on iteration
                }
            } else {
                return false ; // Mismatched Keys
            }
        }
    } else {
        return false; //Differnt amount of keys
    }
    //console.log("Not same")
    return false ; // Not same
}

function termExists( term, type, connection, callback) {
    var selectJoinStatement = "SELECT term.id, term.name, type.name FROM term INNER JOIN type ON term.type=type.id "
    var query = connection.query(selectJoinStatement +"WHERE term.name = ? AND type.name = ?",[term, type], function(error, result, field) {
        if (error) console.log( error ) ;
        if ( result.length > 0) {
            callback(true, term, type) ;
        } else {
            callback(false, term, type) ;            
        }
    })
}

function getTermQueries( term, connection, callback) {
    var selectStatement = "SELECT * from query_term WHERE term = ?" ;
    var query = connection.query(selectStatement,[term], function(error, result, field){
        var queries = []
        for ( var i in result){
            queries.push(result[i].query)
        }
        callback(term,queries);
    })
}


function getTermId( term, type, connection, callback) {
    var id = 0 ;
    var selectJoinStatement = "SELECT term.id, term.name, type.name FROM term INNER JOIN type ON term.type=type.id "
    var query = connection.query(selectJoinStatement +"WHERE term.name = ? AND type.name = ?",[term, type], function(error, result, field) {
        if (error) throw error ;
        callback(result[0].id) ;
    })   
}

function insertTerm( term, type, connection, callback) {
    var insertStatement = "INSERT INTO term (name, type) VALUES (?,?)"
    var typeId = getTypeId(type);
    var query = connection.query(insertStatement  ,[term, typeId], function(error, result, field) {
       // if (error) throw error ;
        callback(result.insertId) ;
    })
}

function getTypeId(type) {
    typeId = 0 ;
    switch(type) {
        case "player":
            typeId = 1 ;
            break;
        case "team":
            typeId = 2;
            break;
        case "author":
            typeId = 3 ;
    } ;

    return typeId ;
}

function getConnection() {
    var connection = mysql.createConnection(
        {
          host     : '127.0.0.1',
          port     : '3306',
          user     : 'dan',
          password : 'charmander',
          database : 'learn'
        }
        );
    return connection;
}

function extractTerms(jsonTerms) {
    var sanitizedTerms = {} ;
    for ( var type in jsonTerms ) {
      sanitizedTerms[type] = [] ;
      if (jsonTerms[type] != null) {    
        var splitString = jsonTerms[type].split(/\s*[,]+\s*/);
        splitString.forEach( function(term) {
          term = term.trim();
          if (term.length > 0) { 
            sanitizedTerms[type].push(term);
          };  
        });
      };
    };
    return sanitizedTerms ;
}

function arrayIntersect ( a, b) {
    var result = [];
    if ( (a.length < 1) || (b.length <1 ) ){
        return [] ;
    }
    aSorted = a.sort();
    bSorted = b.sort();
    while( a.length > 0 && b.length > 0 ) {  
        if      (a[0] < b[0] ){ a.shift(); }
        else if (a[0] > b[0] ){ b.shift(); }
        else /* they're equal */ {
            if( !( isInArray(a[0],result) ) ) {
                result.push(a.shift());
                b.shift();
            } else {
                a.shift();
                b.shift();
            }
            
        }
    }

    return result;
    // http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
}

function isInArray( v , a) {
    return a.indexOf(v) > -1;
}


function getQueryLastSearch (id , connection, callback ){
    var statement = "SELECT * FROM query_search WHERE query = ?"
    var query = connection.query(statement, [id], function(error, result, field) {
        if (result.length == 0) {
            callback(null,null)
        } else {
            var dates = [];
            var totalTweets = 0;
            for (var i in result){
                dates.push(result.date);
                totalTweets += result.tweets_returned;
            }
            var recentDate = new Date( MAth.max.apply(null,dates))
            callback ( recentDate, totalTweets);
        }
    })
}

function queryTwitter(id, date, connection, callback){
    constructTwitterQuery(id, connection, function(statement, author) {
        var client = new Twit({
            consumer_key: 'EOHirXZU4yCQ2LZqKeDRcq6VP',
            consumer_secret: 'QBcO7smz2IA0MSq82tLRWkIhiPaYl4A9w3jzWTb5ZAwfLv0cio',
            access_token: '319135264-2jYrbhEaZBMh5tgPGD5RZ8AHMUSPMfXflvEkCRN6',
            access_token_secret: 'm9tpRt81pydSDh91jiobr4DzUaKjxwTaU2R6YcJpcVcD5'
        });

        if (author == null) {
            client.get('search/tweets', {q: statement , count: 3, since:2000-01-01 },
            function(err, data, response) {
                callback(data);
            })

        } else if (q.length < 1){
            client.get('search/tweets', {from: author , count: 3, since:2000-01-01 },
            function(err, data, response) {
                callback(data);    
            })
        } else {
            client.get('search/tweets', {q: statement, from: author , count: 3, since:2000-01-01 },
            function(err, data, response) {
                callback(data);
            })
        }
    });

}

function addQuerySearchDate(query, tweetAmount,connection){
    var statement = "INSERT INTO query_search (query, date, tweets_returned) VALUES (?,?,?)" ;
    var date = new Date(Date.now());
    var query = connection.query(statement, [query, date, tweetAmount ]);

}
function constructTwitterQuery(id, connection, callback){
    var statement = "SELECT term.name, term.type FROM term INNER JOIN query_term on term.id = query_term.term where (query_term.query = ?) ;"
    var query = connection.query(statement, [id], function(error, result, field) {
        params = {}
        params[1] = []
        params[2] = []
        params[3] = []
        for (var i in result) {
            params[result[i].type].push(result[i].name);
        }
        var q = "(" ;
        // If players OR them
        if ( params[1].length > 0 ) {
            for (var i in params[1]){
                q = q.concat(params[1][i])
                if ( i < (params[1].length - 1)){
                    q = q.concat(" OR ");
                } else {
                    q = q.concat(")")
                }
            }
            if (params[2].length > 0) { // If teams aswell, add AND
                q = q.concat(" AND (")
            }
        } ;
        if (params[2].length > 0) { // Teams with OR seperation
            for (var i in params[2]){
                q = q.concat(params[2][i])
                if ( i < (params[2].length - 1)){
                    q = q.concat(" OR ");
                } else {
                    q = q.concat(")")
                }
            }
        }
        if (params[3].length > 0){ // If author return it
            callback(q,params[3][0]);    
        } else { // If not Null it
            callback(q,null);
        }
        
    })

}

function getAuthorId(user, connection, callback){
    var statement = "SELECT * FROM author WHERE (twitter_id = ?)" 
    var query = connection.query(statement , [user.id_str], function(error , result, field) {
        if (result.length < 1) {
            createAuthor(user,connection, function(id) {
                callback(id);
            })
        } else {
            callback(result[0].id)
        }
    })
}

function createAuthor(user, connection, callback){
    var statement = "INSERT INTO author (twitter_id, name, screen_name, url, verified) VALUES (?,?,?,?,?)"
    var verified = 0 ;
    var url = "https:\/\/twitter.com\/" + user.screen_name
    if (user.verified){
        verified = 1;
    }
    console.log(user.id);
    console.log(user.name);
    var name = utf8.encode(user.name);
    console.log(name);
    var query = connection.query(statement,[user.id_str, name,user.screen_name,url,verified], function( error, results , field ){
        console.log(error);
        callback( results.insertId );
    })
}

function getTweetId(tweet, connection, callback){
    var statement = "SELECT * FROM tweet where (tweet_id = ?) "
    var query = connection.query(statement, [tweet.id_str], function(error, result, field) {
        if (result.length < 1) {
            createTweetPrep( tweet, connection), function(id){
                callback(id);
            }
        } else {
            callback(result[0].id);
        }
    })
}

function createTweetPrep( tweet, connection, callback){
    console.log("HEre comes tweet" );
    console.log(tweet);
    
    //var user = tweet.user
    
    getAuthorId( tweet.user, connection, function(author_id){
        createTweet(tweet, author_id, connection, function(id){
            return (id);
        });
    })
    
}

function createTweet( tweet, author_id, connection, callback){
    var statement = "INSERT INTO tweet (tweet_id, author_id, text, tweet_created_at, url) VALUES(?,?,?,?,?)";
    var dateTime = new Date(tweet.created_at);
    var url = "https:\/\/twitter.com\/"+ tweet.user.screen_name +"\/status\/"+tweet.id_str ;
    var query = connection.query(statement,[tweet.id_str,author_id,utf8.encode(tweet.text),dateTime,url],function(error,result,field){
        console.log(error);
        callback(result.insertId);
    })

}