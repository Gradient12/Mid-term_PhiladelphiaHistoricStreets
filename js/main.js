/*
Topic: Philadelphia historic streets

dataset: philadelphia-historic-streets.geojson

Function summary
1. Switch among three properties:
    Slide 1
      Paving materials
      use different lines to show different paving material;

    Slide 2
      Historic street ranking by length
      use color to show street length;

    Slide 3
      Historic street grouping by class
      use color and/or line weight to show street class; user can control which classes to display

2. Zoom in to show paving material along all historic streets in all slides.

3. All street markers are clickable. When clicked, display information corresponding with color.

Update log:
2016-03-18
1. Navigation changed from "previous-next" flipping buttons to three tab buttons.
2. Text markers angle considers map projection.
3. Added a link to my website. Page theme changed to match my website (wordpress 2014)

Peng Wang
*/

var dataset = 'https://raw.githubusercontent.com/CPLN690-MUSA610/datasets/master/geojson/philadelphia-historic-streets.geojson';

var allStreets = null;
var defaultWeight = 3;
var defaultOpacity = 1;
var textMarkers = [];
var lineMarkers =[];
var countFeature = null;
var slideNumber = 1;

// Prepare to show Legend
var tbl  = document.createElement('table');
tbl.style.position = 'relative';
tbl.style.left = '0px';
tbl.style['margin-top'] = '10px';
tbl.style.color = 'rgb(194, 194, 194)';
tbl.style['font-size'] = '12px';

var sidebar = document.getElementById('sidebar');
sidebar.appendChild(tbl);

// "dictionary" for legend
var pavingMaterialDict = {
    GraniteBlock:["Granite Block","#e29975"],
    Cobblestone:["Cobblestone","#746660"],
    RedBrick:["Red Brick","#b94228"],
    BlueStoneSlab:["Blue Stone Slab","#6f8198"],
    BlueGlazedBrick:["Blue Glazed Brick","#325078"],
    OrangeBrick:["Orange Brick","#E86E1B"],
    YellowBrick:["Yellow Brick","#FFDF61"],
    WoodBlock:["Wood Block","#bd9e63"],
    RedBrickMolded:["Red Brick (Molded)","#9c1716"],
    GraniteBlockWhite:["Granite Block (White)","#b5a2a7"],
    Other:["Other","#383838"]
};

colors = ["#71dcff","#53a1ba","#43889d","#336c7d","#234652","#162b33"];
var streetLengthDict = {
    lengthGroup1:["Shorter than 100",colors[0]],
    lengthGroup2:["100 ~ 200",colors[1]],
    lengthGroup3:["200 ~ 400",colors[2]],
    lengthGroup4:["400 ~ 800",colors[3]],
    lengthGroup5:["Longer than 800",colors[4]],
};

var streetClassDict = {
    classA:["Class 1 ~ Class 3",colors[0]],
    classB:["Class 4 ~ Class 6",colors[1]],
    classC:["Class 7 ~ Class 9",colors[2]],
    classD:["Class 10 ~ Class 12",colors[3]],
    classE:["Class 13 ~ Class 15",colors[4]],
    classF:["Class 16+",colors[5]],
};

var pavingStyle = function(feature) {
  switch (feature.properties.PRIMARYROA) {
    case "Granite Block":
      return {color:"#e29975",weight:defaultWeight,opacity:defaultOpacity};
    case "Cobblestone":
      return {color:"#746660",weight:defaultWeight,opacity:defaultOpacity};
    case "Red Brick":
      return {color:"#b94228",weight:defaultWeight,opacity:defaultOpacity};
    case "Blue Stone Slab":
      return {color:"#6f8198",weight:defaultWeight,opacity:defaultOpacity};
    case "Blue Glazed Brick":
      return {color:"#325078",weight:defaultWeight,opacity:defaultOpacity};
    case "Orange Brick":
      return {color:"#E86E1B",weight:defaultWeight,opacity:defaultOpacity};
    case "Yellow Brick":
      return {color:"#FFDF61",weight:defaultWeight,opacity:defaultOpacity};
    case "Wood Block":
      return {color:"#bd9e63",weight:defaultWeight,opacity:defaultOpacity};
    case "Red Brick (Molded)":
      return {color:"#9c1716",weight:defaultWeight,opacity:defaultOpacity};
    case "Granite Block (White)":
      return {color:"#b5a2a7",weight:defaultWeight,opacity:defaultOpacity};
    default:
      console.log("Unregistered material: " + feature.properties.PRIMARYROA);
      return {color:"#383838",weight:defaultWeight,opacity:defaultOpacity};
  }
};

var lengthStyle = function(feature){
    l = getStreetLength(feature.geometry.coordinates);
    // console.log(l);
    if(l<100){
        return {color:colors[0],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (l>=100 && l<200) {
        return {color:colors[1],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (l>=200 && l<400) {
        return {color:colors[2],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (l>=400 && l<800) {
        return {color:colors[3],weight:defaultWeight,opacity:defaultOpacity};
    }
    else{
        return {color:colors[4],weight:defaultWeight,opacity:defaultOpacity};
    }
};

var classStyle = function(feature){
    c = parseInt(feature.properties.CLASS);
    if(c>=1 && c<=3){
        return {color:colors[0],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (c>=4 && c<=6) {
        return {color:colors[1],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (c>=7 && c<=9) {
        return {color:colors[2],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (c>=10 && c<=12) {
        return {color:colors[3],weight:defaultWeight,opacity:defaultOpacity};
    }
    else if (c>=13 && c<=15) {
        return {color:colors[4],weight:defaultWeight,opacity:defaultOpacity};
    }
    else{
        return {color:colors[5],weight:defaultWeight,opacity:defaultOpacity};
    }
};

// called on slide change
function updateLegendTable(dict){
    var rowCount = tbl.rows.length;
    for (var x=0; x<rowCount; x++) {
        tbl.deleteRow(0);
    }

    var n = Object.keys(dict).length;

    for(var i = 0; i < n; i++){
        var tr = tbl.insertRow();
        var key = Object.keys(dict)[i];
        var td1 = tr.insertCell();
        td1.style.width = '30px';
        td1.style['background-color'] = dict[key][1];
        var td2 = tr.insertCell();
        td2.style.padding = '5px';
        td2.style['padding-left'] = '10px';
        td2.appendChild(document.createTextNode(dict[key][0]));
        td2.style['font-family'] ='helvetica';
    }
}


// Defining a rotating function
// https://github.com/ubergesundheit/Leaflet.EdgeMarker/issues/7
L.RotatedMarker = L.Marker.extend({
    options: {
        angle: 0
    },

    _setPos: function (pos) {
        L.Marker.prototype._setPos.call(this, pos);

        if (L.DomUtil.TRANSFORM) {
            // use the CSS transform rule if available
            this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
        } else if(L.Browser.ie) {
            // fallback for IE6, IE7, IE8
            var rad = this.options.angle * (Math.PI / 180),
                costheta = Math.cos(rad),
                sintheta = Math.sin(rad);
            this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
        }
    }
});

L.rotatedMarker = function (pos, options) {
    return new L.RotatedMarker(pos, options);
};


function getStreetLength(coords){
    var n = coords.length;
    var l = 0;
    if(n ===2){ // two points
        var a1 = coords[0];
        var b1 = coords[1];
        l = haversine(a1,b1);
    }
    else if(n>2){
        for(var i = 0;i< n-1;i++){
            var a2 = coords[i];
            var b2 = coords[i+1];
            l += haversine(a2,b2);
        }
    }
    return l;
}



// Get the center point of a street to show its name.
// A street may contain two or more points.
// if there are more than two points, the street may turn
//      get the middle point by measuring the distance along each segment
// Angle is measured at the center segment
var getStreetCenterAndAngle = function(coords){
    var n = coords.length;
    var midPt = [0,0];
    var angle = 0;
    var result = [];

    if(n ===2){ // two points
        var a1 = coords[0];
        var b1 = coords[1];
        midPt = vectorAvg2d(a1,b1);// disregard projection
        angle = getAngleBasedOnBearing(b1,a1);
    }
    else if(n>2){
        var accumLength = 0;
        var accumLengthArray = [];
        for(var i = 0;i< n-1;i++){
            var a2 = coords[i];
            var b2 = coords[i+1];
            accumLength += distance2d(a2,b2);
            accumLengthArray.push(accumLength);
        }
        // console.log("accumulated length: " + accumLengthArray);

        // find the middle segment
        var halfLength = accumLength/2;
        var middleSegmentNumber = 0;
        for(var j = 0;j< n-1;j++){
            if(accumLengthArray[j]>halfLength){
                middleSegmentNumber = j;
                break;
            }
        }
        // console.log("middleSegmentNumber: " + middleSegmentNumber);

        // use the middle point of the middle segment
        var c = coords[middleSegmentNumber];
        var d = coords[middleSegmentNumber+1];

        midPt = vectorAvg2d(c,d); // disregard projection
        angle = getAngleBasedOnBearing(d,c);
    }
    else{
        midPt = null;
    }
    result.push(midPt);
    result.push(angle);
    return result;
};



function resetTextMarkers(){
    _.each(textMarkers,function(m){
        map.removeLayer(m);
    });
    textMarkers = [];
}

function resetLineMarkers(){
    map.removeLayer(lineMarkers);
}

function resetSidebarText(){
    $('#selectedStreet').text("Select a street to view its properties.");
    $('#selectedStreetProperty1').text("");
}

// remove all markers from the map
var resetMap = function() {
    resetLineMarkers();
    resetTextMarkers();
    resetSidebarText();
};

function testZoomShowStreetText(feature,zoomLv,text){
    if (map.getZoom() >= zoomLv) {
        // show street names
        var latlng = [feature.geometry.coordinates[0][1],feature.geometry.coordinates[0][0]];
        var textIcon = L.divIcon({
            className: 'my-div-icon', // set its style in CSS
            html: text,
            iconSize: [100, 40],
        });

        var centerAndAngle = getStreetCenterAndAngle(feature.geometry.coordinates);
        streetCenter = flipXY(centerAndAngle[0]);
        var streetAngle = -centerAndAngle[1];
        if(streetAngle>90){streetAngle-=180;}
        if(streetAngle<-90){streetAngle+=180;}
        var marker = null;
        if(streetCenter!==null){
            marker = L.rotatedMarker(streetCenter, {icon: textIcon,angle: streetAngle});
        }
        else {
            marker = L.rotatedMarker(latlng, {icon: textIcon,angle: streetAngle});
        }

        if(textMarkers.length<countFeature){ // avoiding duplicates
            textMarkers.push(marker);
            marker.addTo(map);
        }
    }
    else {
        resetTextMarkers();
    }
}

// Defining how each datum is plotted
var eachFeature = function(feature, layer) {
    var propName = '';
    var propValue = '';
    if(slideNumber === 1){
        propName = "Paving material: ";
        propValue = feature.properties.PRIMARYROA;
    }
    else if (slideNumber ===2) {
        propName = "Segment Length: ";
        l = getStreetLength(feature.geometry.coordinates);
        propValue = l.toString();
    }
    else if (slideNumber === 3) {
        propName = "Street Class: ";
        propValue = feature.properties.CLASS;
    }

    layer.on('click', function (e) {
        $('#selectedStreet').text("Name: "+feature.properties.ON_STREET);
        $('#selectedStreetProperty1').text(propName + propValue);

        // fitbounds
        var fitBoundsOptions = { padding: [50, 50] };  // An options object
        map.fitBounds(this.getBounds(), fitBoundsOptions);
    });

    // Some streets are divided into segments.
    //      using this method, the name will appear many times
    map.on('zoomend', function(){
        testZoomShowStreetText(feature,17,propValue);
    });
};




var myFilter = function(feature) {
  return true;
};

// Load data (Slide 1) upon opening the page
$(document).ready(function() {
  $.ajax(dataset).done(function(data) {
    allStreets = JSON.parse(data);
    // console.log(allStreets);
    countFeature = allStreets.features.length;
    loadSlide_Paving();
  });
});

function highlightButtonInGroup(btnId,groupClass) {
    var buttonGroup = document.getElementsByClassName(groupClass)[0];
    var n = buttonGroup.children.length;
    for(var i = 0; i < n; i++) {
        buttonGroup.children[i].className = "slideButton";
    }
    var selected = document.getElementById(btnId);
    selected.className = "selectedButton";
}

function loadSlide_Paving(){
    lineMarkers = L.geoJson(allStreets, {
      onEachFeature: eachFeature,
      style: pavingStyle,
      filter: myFilter
    });
    lineMarkers.addTo(map);
    updateLegendTable(pavingMaterialDict);
    highlightButtonInGroup('btn-streetMaterial','btn-group-vertical');
}

function loadSlide_Length(){
    lineMarkers = L.geoJson(allStreets, {
      onEachFeature: eachFeature,
      style: lengthStyle,
      filter: myFilter
    });
    lineMarkers.addTo(map);
    updateLegendTable(streetLengthDict);
    highlightButtonInGroup('btn-streetLength','btn-group-vertical');
}

function loadSlide_Class(){
    lineMarkers = L.geoJson(allStreets, {
      onEachFeature: eachFeature,
      style: classStyle,
      filter: myFilter
    });
    lineMarkers.addTo(map);
    updateLegendTable(streetClassDict);
    highlightButtonInGroup('btn-streetClass','btn-group-vertical');
}

function loadSlide(slideNumber){
    resetMap();
    switch (slideNumber) {
        case 1:
            loadSlide_Paving();
            break;
        case 2:
            loadSlide_Length();
            break;
        case 3:
            loadSlide_Class();
            break;
        default:
            break;
    }
    console.log("Current slide: " + slideNumber);
}

$( "#btn-streetMaterial" ).click(function() {
    slideNumber = 1;
    loadSlide(slideNumber);
});

$( "#btn-streetLength" ).click(function() {
    slideNumber = 2;
    loadSlide(slideNumber);
});

$( "#btn-streetClass" ).click(function() {
    slideNumber = 3;
    loadSlide(slideNumber);
});


/* =====================
Leaflet Configuration
===================== */

var map = L.map('map', {
  center: [39.9522, -75.1639],
  zoom: 15
});

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);
