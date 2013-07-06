// total number of color pickers as contained in the HTML
var colorPickersCount = 3;

var channelBaseUri = "http://autobahn.tavendo.de/public/demo/colorpicker/";
var newWindowLink = null;

function setupDemo() {

   newWindowLink = document.getElementById('new-window');

   // setup the color pickers
   for (var i = 0; i < colorPickersCount; ++i) {
      setupPicker(i);
   }


   $("#helpButton").click(function() { $(".info_bar").toggle() });

}

function afterAuth() {
   $.farbtastic('#picker0').setColor("#f60");
   $.farbtastic('#picker1').setColor("#555");
   $.farbtastic('#picker2').setColor("#fff");
};



// set colors associated with / controlled by a color picker
function setExtraColors(k, color) {
   // adjust background rectangle color / color text value
   $('#color' + k).css('background-color', color);
   $('#colorvalue' + k).text(color);

   $('#colortext' + k).css('background-color', color);

   $('#colortext' + k + 'a').css('color', color);
   $('#colortext' + k + 'b').css('color', color);
   $('#colortext' + k + 'c').css('color', color);

   $('#c' + k + 'a').css('background-color', color);
   $('#c' + k + 'b').css('background-color', color);
}


// setup color picker by index
function setupPicker(k) {
   $('#picker' + k).farbtastic(function onColorChangeLocal(color) {
      // this is the callback fired when the user manipulates a color picker

      // set colors associated with color picker
      setExtraColors(k, color);

      // publish the color change event on our topic
      sess.publish("event:color-change", { index: k, color: color });
   });
}


// our event handler for processing remote color changes
function onColorChangeRemote(topic, event) {
   // set color in color picker
   $.farbtastic('#picker' + event.index).setColor(event.color, true);

   // set colors associated with color picker
   setExtraColors(event.index, event.color);
};


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {
      sess.unsubscribe("event:color-change");
   }

   sess.prefix("event", channelBaseUri + newChannelId + '#');

   sess.subscribe("event:color-change", onColorChangeRemote);
   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId);
}
