var a = [ 1 , 2 , 3 , 4 , 5]
var b = [1, 1 ,1 ,3, 4 , 7 , 8]

var x = arrayIntersect(a,b);
console.log(x);
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