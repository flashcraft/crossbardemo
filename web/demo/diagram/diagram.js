var el;
var transitionStandardDuration = 1000;

var animation1 = [
      [{ "square1": true, "square2": false, "arrow1_left": false, "arrow1_right": false }, 1000],
      [{ "square1": true, "square2": true, "arrow1_left": false, "arrow1_right": false }, 500],
      [{ "square1": true, "square2": true, "arrow1_left": false, "arrow1_right": true }, 1000],
      [{ "square1": true, "square2": true, "arrow1_left": true, "arrow1_right": false }, 1000],
      [{ "square1": true, "square2": true, "arrow1_left": false, "arrow1_right": false }, 1000]
];

var animation2 = [
      //[{ "square1": [true, 500], "square2": [false], "arrow1_left": [false], "arrow1_right": [false], }, 500],
	  [{ "square1": [true, 500] }, 500],
      [{ "square2": [true] }, 1000],
      [{ "arrow1_right": [true, 1000] }, 1000],
      [{ "arrow1_left": [true, 500], "arrow1_right": [false, 500], }, 1000],
      [{ "arrow1_left": [false, 1000] }, 1000]
];

// format for antimations:
// var animationName = [
// [{ elementName: [[visibilityToggle, transitionTime, transitionType], [xMovement, yMovement, movementTime, movementType]] }, stepTime, eventBeforeNextStep]
// ]

var animation4 = [
   [{ "square1": [[true, 500, "ease-in"]] }, 500, "keypress"],
   [{ "square1": [[false, 500, "linear"]] }, 500],
   [{ "square1": [[true, 500, "ease"], [300, -300, 3000, "linear"]] }, 3000, "keypress"],
   [{ "square1": [[], [-300, 300, 3000, "ease-in"]] }, 3000],
   [{ "square1": [[false, 1000, "ease-in-out"]] }, 1000]
];

$(document).ready(function() {
   el = {
      "square1": $("#square1")[0],
      "square2": $("#square2")[0],
      "arrow1_left": $("#arrow1_left")[0],
      "arrow1_right": $("#arrow1_right")[0],
   };

   $("#keypress").click(function() { diagram.keyPressed()});

   
});

var diagram = {};

var transitionStandardType = "ease";
var movementStandardType = "linear";
var movementStandardDuration = 1000;

diagram.player = function(elements, animation) {
   // catch if already called and animation not finished - IMPLEMENT ME

   var self = this;
   self.counter = 0;

   self.waitingForKeyPress = false;
   self.keyPressed = function() {
      ab.log("key pressed");
      if (self.waitingForKeyPress == true) {
         ab.log("was waiting for it");
         this.switchStates();
      }
   }

   this.switchStates = function() {

      var states = animation[self.counter][0]; // the state switch part of the animation
      // loop over the elements for which state switches are needed
      for (var i in states) {

         if (states.hasOwnProperty(i)) {

            // process the visibility switch, if any
            if (states[i][0].length !== 0) {

               var v = states[i][0];

               // set the transition property
               elements[i].style.webkitTransitionProperty = "opacity";
               elements[i].style.MozTransitionProperty = "opacity";
               elements[i].style.oTransitionProperty = "opacity";  // test             
               elements[i].style.transitionProperty = "opacity";

               // adapt transition duration changes
               var duration = transitionStandardDuration + "ms";
               if (v[1] && v[1] !== undefined) {
                  duration = v[1] + "ms";
               }
               elements[i].style.webkitTransitionDuration = duration;
               elements[i].style.MozTransitionDuraction = duration;
               elements[i].style.oTransitionDuraction = duration;  // test             
               elements[i].style.transitionDuration = duration;

               // adapt the transition type
               var type = transitionStandardType;
               if (v[2] && v[2] !== undefined) {
                  type = v[2];
               }
               elements[i].style.webkitTransitionTimingFunction = type;
               elements[i].style.MozTransitionTimingFunction = type;
               elements[i].style.oTransitionTimingFunction = type; // test
               elements[i].style.transitionTimingFunction = type;

               // switch the states
               if (v[0] === true) {
                  $(elements[i]).addClass("visible");
               }
               else if (v[0] === false) {
                  $(elements[i]).removeClass("visible");
               }
            }

            // process the movement, if any
            if (states[i][1] && states[i][1].length !== 0) {
               ab.log("should move");

               var m = states[i][1];

               // set the transition property
               // set the transition property
               elements[i].style.webkitTransitionProperty = "top, left";
               elements[i].style.MozTransitionProperty = "top, left";
               elements[i].style.oTransitionProperty = "top, left";  // test             
               elements[i].style.transitionProperty = "top, left";
               
               // calculate the new coordinates
               var e = $(el[i]); // get jquery element since this allows access to css properties set via css styles
               var xString = e.css('left');
               var yString = e.css('top');
               var x = parseInt(xString.slice(0, -2), 10); // slice of the 'px'
               var y = parseInt(yString.slice(0, -2), 10);

               ab.log("x " + x, " y " + y);

               if (m[0] !== undefined) {                  
                  var x = x + parseInt(m[0], 10);
               }
               if (m[1] && m[1] !== undefined) {                  
                  var y = y + parseInt(m[0], 10);
               }

               ab.log("nx " + x, " ny " + y);

               // adapt movement duration changes
               var duration = movementStandardDuration + "ms";
               if (m[2] && m[2] !== undefined) {
                  duration = m[2] + "ms";
               } 
               elements[i].style.webkitTransitionDuration = duration;
               elements[i].style.MozTransitionDuraction = duration;
               elements[i].style.oTransitionDuraction = duration;  // test             
               elements[i].style.transitionDuration = duration;

               // adapt the transition type
               var type = movementStandardType;
               if (m[3] && m[3] !== undefined) {
                  type = m[3];
               }
               elements[i].style.webkitTransitionTimingFunction = type;
               elements[i].style.MozTransitionTimingFunction = type;
               elements[i].style.oTransitionTimingFunction = type; // test
               elements[i].style.transitionTimingFunction = type;

               // move
               elements[i].style.left = x + "px";
               elements[i].style.top = y + "px";
            }

            
         }
      }
      // if end not yet reached, execute next animation step
      var timeOut = animation[self.counter][1];
      var event = animation[self.counter][2];

      if (self.counter < animation.length - 1 && timeOut !== undefined ) {
         window.setTimeout(
            function() {
               self.counter += 1;

               if (event !== undefined) {
                  // wait until defined event has happened
                  switch (event) {
                     case "keypress":
                        self.waitingForKeyPress = true;
                        return;
                        break;
                     default:
                        break;
                  }
               }
               
               self.switchStates();
            },
           timeOut);
      }
   };
   this.switchStates();
};



diagram.play = function (elements, animation) {
   diagram.player(elements, animation);
}