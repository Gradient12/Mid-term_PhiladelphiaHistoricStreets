// This file contains methods for vector calculations


var vectorSubtract2d = function(a,b){
    return [a[0]-b[0],a[1]-b[1]];
};

var vectorAvg2d = function(a,b){
    return [(a[0]+b[0])*0.5,(a[1]+b[1])*0.5];
};

var magnitude2d = function(a){
    return Math.sqrt(a[0]*a[0]+a[1]*a[1]);
};

var distance2d = function(a,b){
    return magnitude2d(vectorSubtract2d(a,b));
};

var flipXY = function(vec){
    return [vec[1],vec[0]];
};

// Calculating angle without considering projection is not a good approximation
// var getVectorDirAngle = function(vec){
//     var a = 0;
//     var x = vec[0];
//     var y = vec[1];
//     if(x === 0){
//         if(y===0){a = 0;}
//         else if (y>0) {a= 90;}
//         else {a= -90;}
//     }
//     else if (x>0) {
//         a = Math.atan(y/x)/Math.PI*180;
//     }
//     else {
//         a = Math.atan(y/x)/Math.PI*180;
//         if(a<0){a+=180;}
//         else{a-=180;}
//     }
//     return a;
// };

// Calculate distance between Latitude/Longitude points
// http://www.movable-type.co.uk/scripts/latlong.html
function haversine(p1,p2){
    lat1 = p1[1];
    lat2 = p2[1];
    lon1 = p1[0];
    lon2 = p2[0];
    var phi1 = lat1/180*Math.PI;
    var phi2 = lat2/180*Math.PI;
    var lambda1 = lon1/180*Math.PI;
    var lambda2 = lon2/180*Math.PI;

    var d_phi = phi2-phi1;
    var d_lambda = lambda2-lambda1;

    var a = Math.sin(d_phi/2) * Math.sin(d_phi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(d_lambda/2) * Math.sin(d_lambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var R = 6371000; // metres
    var d = R * c;
    return d*3.28084; // to feet
}

// http://www.movable-type.co.uk/scripts/latlong.html
var getAngleBasedOnBearing = function(p1,p2){
    lat1 = p1[1];
    lat2 = p2[1];
    lon1 = p1[0];
    lon2 = p2[0];
    var phi1 = lat1/180*Math.PI;
    var phi2 = lat2/180*Math.PI;
    var lambda1 = lon1/180*Math.PI;
    var lambda2 = lon2/180*Math.PI;
    var d_lambda = lambda2-lambda1;

    var y = Math.sin(d_lambda)*Math.cos(phi2);
    var x = Math.cos(phi1)*Math.sin(phi2)-Math.sin(phi1)*Math.cos(phi2)*Math.cos(d_lambda);
    var bearing = Math.atan2(y,x)/Math.PI*180;
    return -bearing+90;
};
