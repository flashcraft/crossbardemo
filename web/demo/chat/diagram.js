var el;
var transitionStandardDuration = 0;
var transitionStandardType = "ease";
var movementStandardType = "linear";
var movementStandardDuration = 1000;

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
      "server": $("#sq1")[0],

      "client1": $("#sq2")[0],
      "client2": $("#sq4")[0],
      "client3": $("#sq3")[0],

      "l1up": $("#l1a")[0],
      "l2up": $("#l2a")[0],
      "l3up": $("#l3a")[0],

      "l1down": $("#l1b")[0],
      "l2down": $("#l2b")[0],
      "l3down": $("#l3b")[0],

      "l1dbl": $("#l1c")[0],
      "l2dbl": $("#l2c")[0],
      "l3dbl": $("#l3c")[0],      
      
   };

   $("#keypress").click(function() { diagram.keyPressed()});

   diagram.play(el, initialState);
   
});

var initialState = [
   [{
      "server": [[true]],
      "client1": [[true]], "client2": [[true]], "client3": [[true]],
      "l1up": [[false]], "l2up": [[false]], "l3up": [[false]], "l1down": [[false]], "l2down": [[false]], "l3down": [[false]], "l1dbl": [[false]], "l2dbl": [[false]], "l3dbl": [[false]],
   }, 0]
];

var clearArrows = { "l1up": [[false]], "l2up": [[false]], "l3up": [[false]], "l1down": [[false]], "l2down": [[false]], "l3down": [[false]], "l1dbl": [[false]], "l2dbl": [[false]], "l3dbl": [[false]] };

var pubsub1 = [
   [clearArrows, 1000],
   [{ "l1up": [[true, 300, "ease"]] }, 2000],
   [{ "l2down": [[true, 300, "ease"]], "l3down": [[true, 300, "ease"]] }, 2000]
];
var pubsub2 = [
   [clearArrows, 0],
   [{ "l2up": [[true, 300, "ease"]] }, 1000],
   [{ "l1down": [[true, 300, "ease"]], "l3down": [[true, 300, "ease"]] }, 1000]
];
var pubsub3 = [
   [clearArrows, 0],
   [{ "l3up": [[true, 300, "ease"]] }, 1000],
   [{ "l1down": [[true, 300, "ease"]], "l2down": [[true, 300, "ease"]] }, 1000]
];

// how do I meaningfully chain animations?

var playpubsubs = function() {
   diagram.play(el, pubsub1);
   diagram.play(el, pubsub2);
   diagram.play(el, pubsub3);

};

var diagram = {};

diagram.player = function(elements, animation) {
   console.log("animating");
   // catch if already called and animation not finished - IMPLEMENT ME
   var self = this;

   self.stack = [];
   
   if (self.inprogress) {
      console.log("animation already in progress, pushing to stack");
      this.stack.push([elements, animation]);
   }

   

   self.counter = 0;
   self.inProgress = false;

   self.waitingForKeyPress = false;
   self.keyPressed = function() {
      ab.log("key pressed");
      if (self.waitingForKeyPress == true) {
         ab.log("was waiting for it");
         this.switchStates();
      }
   }

   this.addToStack = function() {
      console.log("added to stack");
   };

   this.switchStates = function() {
      self.inProgress = true;
      console.log("step");


      var states = animation[self.counter][0]; // the state switch part of the animation
      // loop over the elements for which state switches are needed
      for (var i in states) {
         

         if (states.hasOwnProperty(i)) {
            
            // process the visibility switch, if any
            if (states[i][0].length !== 0) {
               console.log("i", i);
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
                  elements[i].style.opacity = 1;
                  //$(elements[i]).addClass("visible");
               }
               else if (v[0] === false) {
                  elements[i].style.opacity = 0;
                  //$(elements[i]).removeClass("visible");
               }
            }

            // process the movement, if any
            if (states[i][1] && states[i][1].length !== 0) {
               //console.log("should move");

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

               //console.log("x " + x, " y " + y);

               if (m[0] !== undefined) {                  
                  var x = x + parseInt(m[0], 10);
               }
               if (m[1] && m[1] !== undefined) {                  
                  var y = y + parseInt(m[0], 10);
               }

               //console.log("nx " + x, " ny " + y);

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

      if (self.counter < animation.length - 1 && timeOut !== undefined) {
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
         //console.log("is this called immediately?");
      else if (self.counter === animation.length - 1) {
         // this is the end of the processing of the present animation, 
         // but the execution extends beyond that if individual element fades or movements
         // have a duration ???
         console.log("end of present animation reached");
         self.inProgress = false;
      };
   };
   this.switchStates();
};



diagram.play = function (elements, animation) {
   diagram.player(elements, animation);
}