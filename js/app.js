// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  var graph;
  var xPadding = 30;
  var yPadding = 30;

  var data = { values:[
  ]};

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---

  function start() {

    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');

    // add event listener
    window.addEventListener("devicemotion", handleMotion, true);
    console.log('devicemotion listener');
    graph = document.getElementById('graph');
  }
  
  function getMaxY() {
      var max = 0;
      for(var i=0; i<data.values.length; i++) {
          if(data.values[i].Y > max) {
              max = data.values[i].Y;
          }
      }

      max += 10 - max % 10;
      return max;
  }

  function getXPixel(val) {
      return ((graph.width - xPadding) / data.values.length) * val + (xPadding * 1.5);
  }
  
  function getYPixel(val) {
      return graph.height - (((graph.height - yPadding) / getMaxY()) * val) - yPadding;
  }
  
  function addDataValues(xval,yval,zval) {
      data.values.push({ X: xval, Y: yval, Z: zval});
  }

  function handleMotion(event) {
//    console.log('handleMotion');
    var a_x = event.accelerationIncludingGravity.x;
    var a_y = event.accelerationIncludingGravity.y;
    var a_z = event.accelerationIncludingGravity.z;
    var t = event.interval;
    addDataValues(a_x, a_y, a_z);
//    console.log('a=['+a_x+','+a_y+','+a_z);
    document.getElementById('a_x').textContent = a_x;
    document.getElementById('a_y').textContent = a_y;
    document.getElementById('a_z').textContent = a_z;
    var c = graph.getContext('2d');
    c.lineWidth = 2
    c.strokeStyle = '#333';
    c.font = 'italic 8pt sans-serif';
    c.textAlign = "center";
    c.beginPath();
    c.moveTo(xPadding, 0);
    c.lineTo(xPadding, graph.height - yPadding);
    c.lineTo(graph.width, graph.height - yPadding);
    c.stroke();
      // draw a line
      c.strokeStyle = '#f00';
      c.beginPath();
      for(var i=0; i<data.values.length; i++) {
          var x = getYPixel(data.values[i].X);
	  console.log('i='+i+'X='+x);
	  c.lineTo(getXPixel(i), x);
      }
      c.stroke();
  }

});
