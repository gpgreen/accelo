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
  var verScale = 3;
  var yPixelScale;
  var yAxis;
  var data = { 
      xOn:true,
      yOn:true,
      zOn:true,
      maxLen:0,
      len:0,
      offset:0,
      values:[],
      pixels:[]
  };

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---
  init();

  function start() {

      //var message = document.getElementById('message');

      // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
      // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
      //message.textContent = translate('message');

  }
  
  function init() {
      var elements;
      console.log("init start");

      elements = {
	  xswitch: document.getElementById('x-switch'),
	  yswitch: document.getElementById('y-switch'),
	  zswitch: document.getElementById('z-switch')
      };

      elements.xswitch.addEventListener('click', function() {
	  var val;
	  if(elements.xswitch.hasAttribute('checked')) {
	      val = false;
	      elements.xswitch.removeAttribute('checked');
	  }
	  else {
	      val = true;
	      elements.xswitch.setAttribute('checked', val);
	  }
	  data.xOn = val;
	  console.log("xswitch:"+val);
      }, true);
					
      elements.yswitch.addEventListener('click', function() {
	  var val;
	  if(elements.yswitch.hasAttribute('checked')) {
	      val = false;
	      elements.yswitch.removeAttribute('checked');
	  }
	  else {
	      val = true;
	      elements.yswitch.setAttribute('checked', val);
	  }
	  data.yOn = val;
	  console.log("yswitch:"+val);
      }, true);
					
      elements.zswitch.addEventListener('click', function() {
	  var val;
	  if(elements.zswitch.hasAttribute('checked')) {
	      val = false;
	      elements.zswitch.removeAttribute('checked');
	  }
	  else {
	      val = true;
	      elements.zswitch.setAttribute('checked', val);
	  }
	  data.zOn = val;
	  console.log("zswitch:"+val);
      }, true);
					
      // calculate graph scaling vars
      graph = document.getElementById('graph');

      // initialize data structure
      data.maxLen = (graph.width - xPadding) / 2;
      data.values = new Float64Array(data.maxLen*3);
      data.pixels = new Int32Array(data.maxLen*3);

      // pixels/accel val
      yPixelScale = (graph.height - yPadding) / 9.80665 / verScale;
      // location of y axis, accel = 0
      yAxis = (graph.height - yPadding) / 2;

      // add event listener
      window.addEventListener("devicemotion", handleMotion, true);
      //console.log("listen to 'devicemotion'");

      // setup the draw function
      setInterval(draw, 100);
  }

  function calcXPixel(val) {
      return val * 2 + xPadding;
  }
  
  function calcYPixel(val) {
      return graph.height - (yPixelScale * val) - yPadding - yAxis;
  }
  
  function addDataValues(xval,yval,zval) {
      // add the values to the two arrays. The first array is the value array
      // the second array is the pixel array which is used to draw the graph
      // because this is a fixed length array, we do not add/remove array elements
      // but have an offset to the current starting point in the array.
      // Because the array may not be entirely filled up yet, there needs to 
      // be logic to account for that

      var startI, i;

      // set the length or the starting offset
      if(data.len === data.maxLen) {
	  data.offset++;
	  if(data.offset === data.maxLen)
	      data.offset = 0;
      }
      else {
	  data.len++;
      }

      // find the current starting array position, then add the length
      // to get the place to insert the data
      startI = data.offset + data.len;
      if(startI >= data.maxLen) {
	  startI -= data.maxLen;
      }
      startI *= 3;

      // insert the data values
      i = startI;
      data.values[i++] = xval;
      data.values[i++] = yval;
      data.values[i] = zval;

      // insert the pixel values
      i = startI;
      data.pixels[i++] = calcYPixel(xval);
      data.pixels[i++] = calcYPixel(yval);
      data.pixels[i] = calcYPixel(zval);
  }

  function getPixel(index, element) {
      var i = index + data.offset;
      if(i >= data.maxLen)
	  i = i - data.maxLen;
      return data.pixels[i*3+element];
  }

  function handleMotion(event) {
      // console.log('handleMotion');
      var a_x = event.accelerationIncludingGravity.x;
      var a_y = event.accelerationIncludingGravity.y;
      var a_z = event.accelerationIncludingGravity.z;
      //var t = event.interval;
      addDataValues(a_x, a_y, a_z);
      //console.log('a=['+a_x+','+a_y+','+a_z);
      if(data.xOn) {
	  document.getElementById('a_x').textContent = a_x;
      }
      else {
	  document.getElementById('a_x').textContent = "";
      }
      if(data.yOn) {
	  document.getElementById('a_y').textContent = a_y;
      }
      else {
	  document.getElementById('a_y').textContent = "";
      }
      if(data.zOn) {
	  document.getElementById('a_z').textContent = a_z;
      }
      else {
	  document.getElementById('a_z').textContent = "";
      }
  }

  function draw() {
      var ctx = graph.getContext('2d');

      // clear the graph background
      ctx.fillStyle = "#000000";
      ctx.fillRect(xPadding, 0, graph.width-xPadding, graph.height-yPadding);

      // draw the axis
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.font = 'italic 8pt sans-serif';
      ctx.textAlign = "center";
      ctx.beginPath();
      ctx.moveTo(xPadding, yAxis);
      ctx.lineTo(graph.width, yAxis);
      ctx.stroke();

      // draw x graph
      if(data.xOn) {
	  ctx.strokeStyle = '#ff0000';
	  ctx.lineWidth = 1;
	  ctx.beginPath();
	  for(var i=0; i<data.len; i++) {
	      //console.log('i='+i+' X='+getPixel(i, 0));
	      ctx.lineTo(calcXPixel(i), getPixel(i, 0));
	  }
	  ctx.stroke();
      }

      // draw y graph
      if(data.yOn) {
	  ctx.strokeStyle = '#00ffff';
	  ctx.beginPath();
	  for(var i=0; i<data.len; i++) {
	      //console.log('i='+i+' Y='+getPixel(i, 1));
	      ctx.lineTo(calcXPixel(i), getPixel(i, 1));
	  }
	  ctx.stroke();
      }

      // draw z graph
      if(data.zOn) {
	  ctx.strokeStyle = '#00ff00';
	  ctx.beginPath();
	  for(var i=0; i<data.len; i++) {
	      //console.log('i='+i+' Z='+getPixel(i, 2));
	      ctx.lineTo(calcXPixel(i), getPixel(i, 2));
	  }
	  ctx.stroke();
      }
  }

});
