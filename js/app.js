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
      return 9.8;
  }

  function getXPixel(val) {
      return val + xPadding;
  }
  
  function getYPixel(val) {
      return graph.height - (((graph.height - yPadding) / getMaxY()/2) * val) - yPadding;
  }
  
  function addDataValues(xval,yval,zval) {
      // the array has a maximum length
      if(data.values.length >= graph.width - xPadding) {
	  data.values.shift();
      }
      data.values.push({X: xval, Y: yval, Z: zval});
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
      // clear the rectangle
      c.clearRect(0,0,graph.width,graph.height);
      c.lineWidth = 2;
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
      c.lineWidth = 1;
      c.beginPath();
      for(var i=0; i<data.values.length; i++) {
	  var ix = getXPixel(i);
          var x = getYPixel(data.values[i].X);
	  console.log('i='+i+' ix='+ix+' X='+x);
	  c.lineTo(ix, x);
      }
      c.stroke();
  }

});
