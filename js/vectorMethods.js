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

var getVectorDirAngle = function(vec){
    var a = 0;
    var x = vec[0];
    var y = vec[1];
    if(x === 0){
        if(y===0){a = 0;}
        else if (y>0) {a= 90;}
        else {a= -90;}
    }
    else if (x>0) {
        a = Math.atan(y/x)/Math.PI*180;
    }
    else {
        a = Math.atan(y/x)/Math.PI*180;
        if(a<0){a+=180;}
        else{a-=180;}
    }
    return a;
};
