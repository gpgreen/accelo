// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  // global variables for this app
  var graph;
  var xPadding = 20;
  var yPadding = 30;
  var verScale = 2.2;
  var yPixelScale;
  var yAxis;
  var data = { 
      values:[],
      pixels:[]
  };

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
      //console.log("listen to 'devicemotion'");

      // calculate graph scaling vars
      graph = document.getElementById('graph');
      // pixels/accel val
      yPixelScale = (graph.height - yPadding) / 9.80665 / verScale;
      // location of y axis, accel = 0
      yAxis = (graph.height - yPadding) / 2;
  }
  
  function getXPixel(val) {
      return val * 2 + xPadding;
  }
  
  function getYPixel(val) {
      return graph.height - (yPixelScale * val) - yPadding - yAxis;
  }
  
  function addDataValues(xval,yval,zval) {
      // the array has a maximum length
      if(data.values.length >= (graph.width - xPadding) / 2) {
	  data.values.shift();
	  data.pixels.shift();
      }
      data.values.push({X: xval, Y: yval, Z: zval});
      data.pixels.push({X: getYPixel(xval),
			Y: getYPixel(yval),
			Z: getYPixel(zval)})
  }
  function handleMotion(event) {
      // console.log('handleMotion');
      var a_x = event.accelerationIncludingGravity.x;
      var a_y = event.accelerationIncludingGravity.y;
      var a_z = event.accelerationIncludingGravity.z;
      var t = event.interval;
      addDataValues(a_x, a_y, a_z);
      // console.log('a=['+a_x+','+a_y+','+a_z);
      document.getElementById('a_x').textContent = a_x;
      document.getElementById('a_y').textContent = a_y;
      document.getElementById('a_z').textContent = a_z;
      var c = graph.getContext('2d');
      // clear the graph background
      c.fillStyle = "#000000";
      c.fillRect(xPadding, 0, graph.width-xPadding, graph.height-yPadding);
      // draw the axis
      c.lineWidth = 2;
      c.strokeStyle = '#ffffff';
      c.font = 'italic 8pt sans-serif';
      c.textAlign = "center";
      c.beginPath();
      c.moveTo(xPadding, yAxis);
      c.lineTo(graph.width, yAxis);
      c.stroke();
      // draw x line
      c.strokeStyle = '#ff0000';
      c.lineWidth = 1;
      c.beginPath();
      for(var i=0; i<data.pixels.length; i++) {
	  //console.log('i='+i+' X='+data.pixels[i].X);
	  c.lineTo(getXPixel(i), data.pixels[i].X);
      }
      c.stroke();
      // draw y line
      c.strokeStyle = '#00ffff';
      c.beginPath();
      for(var i=0; i<data.pixels.length; i++) {
	  //console.log('i='+i+' Y='+data.pixels[i].Y);
	  c.lineTo(getXPixel(i), data.pixels[i].Y);
      }
      c.stroke();
      // draw z line
      c.strokeStyle = '#00ff00';
      c.beginPath();
      for(var i=0; i<data.pixels.length; i++) {
	  //console.log('i='+i+' Z='+data.pixels[i].Z);
	  c.lineTo(getXPixel(i), data.pixels[i].Z);
      }
      c.stroke();
  }

});
