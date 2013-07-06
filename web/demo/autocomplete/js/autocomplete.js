/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

var examineMe;

var channelBaseUri = "http://tavendo.de/webmq/demo/autocomplete#";

var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var sess = null;
var retryCount = 0;
var retryDelay = 2;

// works
function updateStatusline(status) {
   if (sess && sess._websocket && sess._websocket.extensions && sess._websocket.extensions !== "") {
      $(".statusline").text(status + " [" + sess._websocket.extensions + "]");
   } else {
      $(".statusline").text(status);
   }
}

// works
function connect() {

   ab._Deferred = jQuery.Deferred;

   ab.connect(wsuri,

      function(session) {
         sess = session;
         ab.log("connected!");
         onConnect0();
      },

      function(code, reason, detail) {

         sess = null;
         switch (code) {
            case ab.CONNECTION_UNSUPPORTED:
               window.location = "https://webmq.tavendo.de:9090/help/browsers";
               //alert("Browser does not support WebSocket");
               break;
            case ab.CONNECTION_CLOSED:
               window.location.reload();
               break;
            default:
               ab.log(code, reason, detail);

               retryCount = retryCount + 1;
               updateStatusline("Connection lost. Reconnecting (" + retryCount + ") in " + retryDelay + " secs ..");

               break;
         }
      },

      { 'maxRetries': 60, 'retryDelay': 2000 }
   );
}

// works
function onConnect0() {
   sess.authreq().then(function() {
      sess.auth().then(onAuth, ab.log);
   }, ab.log);
}

// works
function onAuth(permissions) {
   ab.log("authenticated!", permissions);

   updateStatusline("Connected to " + wsuri);
   retryCount = 0;

   sess.prefix("api", channelBaseUri);

   // make call to establish whether necessary oracle connection is available   
   sess.call("api:search", "a", { "after": 0, "limit": 10 }).then(ab.log, onOraCallError);

   sess.call("api:count", "").then(function(count) {
      var formatedCount = parseInt(count/1000) + "." + parseInt((count/1000 - parseInt(count/1000))*1000);
      vm.totalRecords(formatedCount);
   }, ab.log);
}


function onOraCallError(error) {
   ab.log("oce", error);
   $("#error_overlay").show();
}

// global state variables
var suggestionsArrays = []; // contains the one or more arrays with autocomplete suggestions
var maxSuggestionsArraysLength = 3; // maximum length of arrays to keep stored locally. should be at least 3. 

var arrayPosition = [0, 0]; // current position within the suggestions cache starting from which the currently displayed suggestions in the box are extracted
// should better bet:
   // var currentArray = 0;
   // var positionInArray = 0;
   // please REFACTOR
var arrayCounter = null; // the position of the currently used array within the total result set, e.g. 5 = the fifth array received
var endInLastArray = false; // flag for end of the full results set contained in the last array in the arrays

var limit = 30; // max number of suggestions in the results set from the DB
var comfortZone = 10; // distance from the beginning/end of an array at which check for next/previous array is initiated

var listPosition = 0; // current position within the items displayed in the box

var currentItemId = null; // the id of the currently highlighted item in the box
var maxDisplay = 10; // max number of suggestions to display in the box

var currentDetailsId = null; // the id of the item shown in the details view
var currentSubscriptions = []; // stores any current subscriptions as strings that can be used directly as the argument for unsubscribe

var selectField = null; // the name of the key for the values which autocomplete filters
var selectValue = null; // the current value which to prefix match

var nextSetRequested = false; // next item set requested, but not yet received
var previousSetRequested = false; // previous item set requested, but not yet received

function logState() {
   ab.log(
      "arrays", suggestionsArrays.length,
      "arrayposition 0", arrayPosition[0],
      "arrayposition 1", arrayPosition[1],
      "arrayCounter", arrayCounter,
      "endinlast", endInLastArray
      );
}

// works
$(document).ready(function() {
   updateStatusline("Not connected.");

   setupDemo();

   connect();
});

function ViewModel() {

   var self = this;


   self.enteredName = ko.observable("");
   self.sendChange = function() {
      selectField = "name";
      selectValue = self.enteredName();
      onSelectorChanged();
      //return true; // otherwise default key action is cancelled (needed if called via event binding)
   };
   self.enteredName.subscribe(self.sendChange);

   self.totalRecords = ko.observable();

   self.handleCursor = function(viewmodel, event) {
      switch (event.which) {
         case 13:
            if (self.enteredName !== "" && currentItemId !== null) {
               // ignores the case when something has been entered,
               // but the processing of the entry hasn't yet extended to setting
               // the correct currentItemID:
               //    - no initial currentItemID --> enter doesn't do anything
               //    - incorrect currentItemID --> selects wrong(previous) item
               // FIXME ?
               selectItem();
            }
            break;
         case 38:
            // keydown events are processed to move the selection in the suggestions box
            // keyup events are used to determine when the user has stopped moving the 
            // cursor, and the request for the item details is only sent then, based on the 
            // global 'currentItemId' variable that was set by the keydown handler
            if (event.type === "keydown") {
               cursorMove("up");
               return false; // prevent default, which sets the cursor to the beginning of the text box in chrome
            }
            else if (event.type === "keyup") {
               // needs to catch up at the beginning of the results list - FIXME
               // = item details displayed === item details to request
               if (currentDetailsId !== currentItemId) {
                  requestItemDetails(currentItemId);
               }
            }
            break;
         case 40:
            if (event.type === "keydown") {
               cursorMove("down");
               return false;
            }
            else if (event.type === "keyup") {
               // needs to catch down at the end of the results list - FIXME
               if (currentDetailsId !== currentItemId) {
                  requestItemDetails(currentItemId);
               }
            }
            break;
         default:
            break;
      }

      return true; // retain default behaviour
   };

   self.suggestionClicked = function(item) {
      // get the item id from the html list element id
      var itemId = item.id;
      selectItem(itemId);
   };

   self.autocompleteSuggestions = ko.observableArray([]);

   //self.name = ko.observable("");
   //self.customerNumber = ko.observable("");
   //self.street = ko.observable("");
   //self.zipcode = ko.observable("");
   //self.city = ko.observable("");
   //self.phone = ko.observable("");
   //self.email = ko.observable("");
   //self.twitterHandle = ko.observable("");
   //self.characterCount = ko.observable("");
   //self.lastTweet = ko.observable("");

   self.name = ko.observable("");
   self.birthdate = ko.observable("");
   self.birthplace = ko.observable("");
   self.deathdate = ko.observable("");
   self.deathplace = ko.observable("");
   self.descr = ko.observable("");

   self.detailsGreyedOut = ko.observable(true);
   self.selectorEmpty = ko.observable(true);

   self.requestsForAutocompleteSuggestions = ko.observable(0);
   self.receivedAutocompleteSuggestions = ko.observable(0);
   self.currentCacheSize = ko.observable(0);
   self.requestedDetailsStatic = ko.observable(0);
   //self.requestedDetailsAdditional = ko.observable(0);
   self.currentMatches = ko.observable(0);

}

// works
function selectItem(itemId) {
   ab.log("sel", itemId);
   // reached via 'enter' or click on an item
   // via enter does not pass an itemId, since the details
   // were already requested on the highlighting of the item

   // clear the selection input + suggestions box
   vm.enteredName("");

   var cs = {};
   cs.items = [];
   cs.above = false;
   cs.below = false;
   cs.display = false;
   updateSuggestions(cs);

   // reset global state
   suggestionsArrays = [];
   listPosition = 0;
   arrayPosition = [0, 0];
   // currentItem = {}; - not, because response for details RPC might still be outstanding

   // request details to display
      //// first request if clicked
   if (itemId) {
      ab.log("request");
      currentItemId = itemId;
      requestItemDetails(itemId);
   }
      //// additional request on enter, since the details are cleared
      //// when the selection input is cleared
   else {
      requestItemDetails(currentItemId);
   }
}

// works
function requestItemDetails(itemId) {
   var self = this;

   // sends request for item details 
   currentItemId = itemId; // set to enable check whether return still needed (???? should be set by the calling function, this here should not change values outside of its functional scope)

   // for static details
   sess.call("api:get", itemId).then(function(details) {
      // check if item still current
      if (details.id === currentItemId) {
         updateDetails(details);
         // set global currentDetail value
         currentDetailsId = details["id"];
      }
   }, ab.log);

   // increase requests counter
   vm.requestedDetailsStatic(vm.requestedDetailsStatic() + 1);

   //  wait before requesting the more costly item details
   //var waitingPeriod = 1000;
   //window.setTimeout(function() { requestAdditionalItemDetails(itemId) }, waitingPeriod);
}

// unnecessary in present version
//function requestAdditionalItemDetails (itemId) {

//   if (currentItemId === itemId) {
//      // for 'expensive' details
//      sess.call("api:get-itemdetails-expensive", itemId).then(updateDetails, ab.log);

//      // for subscription details
//      sess.call("api:get-itemdetails-subscription", itemId).then(updateDetails, ab.log);
//      sess.subscribe("event:itemdetail-changed/" + itemId, function(topicUri, event) {
//         updateDetails(event);
//      });
//      currentSubscriptions = ["event:itemdetail-changed/" + itemId];
//      // increase requests counter
//      vm.requestedDetailsAdditional(vm.requestedDetailsAdditional() + 1);
//   }
//}

var vm = new ViewModel(); // instantiates the view model and makes its methods accessible 

// works
function setupDemo() {

   // apply the view model bindings
   ko.applyBindings(vm);

   // set focus to the input box
   document.getElementById("enteredName").focus();

   // hide the box initially
   updateSuggestions({ "display": false });

   $("#helpButton").click(function() {
      $(".info_bar").toggle();
   });

}

/************************************************
*     handling of input on the box              *
*************************************************/

function cursorMove(direction) {
   //ab.log("cursorMove", listPosition, arrayPosition[1]);
   // blank the details
   blankOutDetails();
   //cancelSubscriptions();

   //change selection within the currently displayed items
   var positionChange = direction === "down" ? 1 : -1;
   var newPosition = listPosition + positionChange;

   // limit the maxMoveWithinBox to suggestions list length 
   // if list completely displayed in suggestions box
   var listItems = $("#suggestionsList").children("li");
   var listItemCount = listItems.length;
   var maxMoveWithinBox = listItemCount < maxDisplay ? listItemCount : maxDisplay;

   // movement within currently displayed items possible?
   if (moveWithinList(newPosition, maxMoveWithinBox, listItems)) {
      return;
   }

   // prevent movement at beginning and end of the list
   if (checkBeginningOrEnd(newPosition, maxMoveWithinBox)) {
      return;
   }

   // check whether comfort zone for the present array has been reached, 
   // for position in first array & not the beginning of the results set
   // or last array and end of the results set not in this array
   if ((arrayPosition[0] === 0 && arrayCounter !== 0) || (arrayPosition[0] === suggestionsArrays.length - 1 && !endInLastArray)) {
      checkComfortZone(newPosition);
   }

   // update the array positions
   updateArrayPositions(newPosition);

   // update list position
   if (newPosition < 0) {
      listPosition = 0;
   }
   else if (newPosition > vm.autocompleteSuggestions.length - 1) {
      listPosition = vm.autocompleteSuggestions().length - 1;
   }

   // display the updated set of items in the box
   var cs = getCurrentSuggestionsSet();
   // console.log("suggestions to display", cs, itemFromNext);
   updateSuggestions(cs);

   // set the currentItemId
   currentItemId = cs.items[listPosition].id;
}

/*
   returns the current set of suggestions to display in the 
   suggestions box 
*/
function getCurrentSuggestionsSet() {
   var cs = {};

   var toggles = toggleAboveBelow();
   cs.above = toggles["above"];
   cs.below = toggles["below"];

   cs.items = getSuggestionsItemSet();
   // console.log("items", cs.items);
   cs.position = listPosition;

   return cs;
}

/*
   Checks whether the curso movement can be executed by changing the
   position with in the currently displayed suggestions list in the box,
   without any scrolling
*/
function moveWithinList(newPosition, maxMoveWithinBox, listItems) {
   // catch special case: no items in list (nothing entered yet, no results back yet) 
   if (maxMoveWithinBox === 0) {
      return true;
   }

   if (newPosition >= 0 && newPosition < maxMoveWithinBox) {

      // update list position
      listPosition = newPosition;

      // change highlighting to item at position
      updateSuggestions({ "position": listPosition });

      // change currentId      
      var newId = listItems[listPosition].id;
      currentItemId = parseInt(newId, 10);
      //ab.log("mwi", currentItemId);
      // ab.log("moved within list");
      return true;
   }
   // ab.log("scroll list");
   return false;
}

/*
   Checks whether any more scrolling is possible in principle
*/
function checkBeginningOrEnd(newPosition, maxMoveWithinBox) {
   // beginning of the suggestions reached
   max = maxMoveWithinBox;

   // works
   if (newPosition === -1 && arrayCounter === 0 && arrayPosition[1] === 0) {
      ab.log("at the top");
      return true;
   }

   // ab.log("endcheck data", endInLastArray, listPosition === maxMoveWithinBox - 1, suggestionsArrays[suggestionsArrays.length - 1][suggestionsArrays[suggestionsArrays.length - 1].length - 1].id, vm.autocompleteSuggestions()[vm.autocompleteSuggestions().length - 1].id);

   // end of the suggestions reached
   if (endInLastArray /* no new arrays to get */ && listPosition === maxMoveWithinBox - 1 /* list position is at the end of the list */ && suggestionsArrays[suggestionsArrays.length - 1][suggestionsArrays[suggestionsArrays.length - 1].length - 1].id === vm.autocompleteSuggestions()[vm.autocompleteSuggestions().length - 1].id
         /* id of last element in this last array matches id of the last item in the suggestions box */
      ) {
      ab.log("the end");
      return true;
   }
}

/*

*/
function updateArrayPositions(newPosition) {
   // ab.log("updateArrayPositions", arrayPosition[1], newPosition, listPosition);
   // we are scrolling, so adjust the positions for getting the new cut

   if ((arrayPosition[1] + newPosition) < 0) {
      // new position in previous array;

      arrayPosition[0] = arrayPosition[0] - 1;
      arrayCounter = arrayCounter - 1; // decrease array counter
      ab.log("scroll into previous array " + arrayPosition[0] + " arrayCounter now " + arrayCounter);
      // var overhang = Math.abs(arrayPosition[1] + newPosition); // will usually be 1, since NewPosition shouldn't go lower than -1
      // arrayPosition[1] = (suggestionsArrays[arrayPosition[0]].length - 1) - overhang;
      arrayPosition[1] = (suggestionsArrays[arrayPosition[0]].length - 1); // with position change = 1 position, this should work - CHECKME
   }
   else if (arrayPosition[1] + newPosition - listPosition > suggestionsArrays[arrayPosition[0]].length) {
      // new position within next array

      arrayPosition[0] = arrayPosition[0] + 1;
      arrayCounter = arrayCounter + 1;
      ab.log("scroll into next array", arrayPosition[0], arrayCounter);
      // var overhang = suggestionsArrays[arrayPosition[0]].length - (arrayPosition[1] + newPosition - listPosition - 1);
      // arrayPosition[1] = overhang;
      arrayPosition[1] = 0; // with position change = 1 position, this should work - CHECKME
   }
   else {
      // ab.log("scroll within current array", arrayPosition[1]);
      // ab.log("within current", arrayPosition[1], newPosition, listPosition);
      // new position within current array
      arrayPosition[1] = arrayPosition[1] + newPosition - listPosition;
      //ab.log("array", arrayPosition[1]);
   }
}

// buggy -try "Gauss" and see the behaviour of the below indicator
function toggleAboveBelow() {
   var toggles = {};
   // not in first array, or offset not at beginning of an array
   if (arrayPosition[0] > 0 || arrayPosition[1] > 0) {
      toggles.above = true;
   }
   else {
      toggles.above = false;
   }
   // not in last array, or
   // in last array & current set does not include the end of the array
   if (endInLastArray /* no new arrays to get */ && suggestionsArrays[suggestionsArrays.length - 1][suggestionsArrays[suggestionsArrays.length - 1].length - 1].id === vm.autocompleteSuggestions()[vm.autocompleteSuggestions().length - 1].id /* id of last element in this last array matches id of the last item in the suggestions box */
      ) {
      toggles.below = false;
   }
   else {
      toggles.below = true;
   }
   return toggles;
}

// works except for the branching that handles next array not there yet
/*
   Returns the set of items to currently display in the suggestions box
*/
function getSuggestionsItemSet() {
   var self = this;

   this.getAdditional = function() {
      var additionalNeeded = maxDisplay - slice.length;
      // console.log("additionalNeeded ", additionalNeeded);
      for (var i = 0; i < additionalNeeded; i++) {
         // console.log("pushing ", suggestionsArrays[arrayPosition[0] + 1][i]);
         slice.push(suggestionsArrays[arrayPosition[0] + 1][i]);
      }
      // console.log("slice ", slice);
      return slice;
   };

   // gets a set of size maxDisplay (or smaller if at end of last array)
   // needs to handle the case that this extends across two arrays
   // assumes that the individual arrays are larger than the maximum number of items to display
   // i.e. that a request can in principle be fulfilled from a single array
   var extractedItemSet = [];
   // slice from the present position within the present array
   var slice = suggestionsArrays[arrayPosition[0]].slice(arrayPosition[1], arrayPosition[1] + maxDisplay);

   // check if this is smaller than maxDisplay, and exclude cases where this is
   // because the end of the full results set has been reached
   if (slice.length < maxDisplay && // results set not big enough
      ((arrayPosition[0] < suggestionsArrays.length - 1) || // not last array
      (arrayPosition[0] === suggestionsArrays.length - 1 && !endInLastArray))) { // last array, but more should come

      // get missing elements from the next array

      var additionalNeeded = maxDisplay - slice.length;
      // check that the next array already exists
      // if not, block, recheck periodically, then progress once its there
      if (suggestionsArrays[arrayPosition[0] + 1]) {
         return self.getAdditional();
      }
      else {
         // this branching doesn't work properly yet - FIXME
         ab.log("not present yet - FIXME");

         // function checkForNextArrayExists(timeout) {
         //    window.setTimeout(
         //       function() {
         //          if (suggestionsArrays[arrayPosition[0] + 1]) {
         //             ab.log("array delivered");
         //             return self.getAdditional();
         //          }
         //          else {
         //             checkForNextArrayExists(20);
         //          }
         //       }, timeout
         //    );
         // }
      }
   }
   else {
      // slice extends to the end, so just return it
      return slice;
   }

   // Alternative implementation of the above, works as far as it's there
   // written during bug hunting - PICK THE ONE THAT SEEMS NICER
   // // check how to handle slices that are shorter than maxDisplay
   // if (slice.length < maxDisplay) {
   //    // ab.log("shorter slice");
   //    // slice shorter because there are no more items in the full results set
   //    if (arrayPosition[0] === suggestionsArrays.length - 1 && // is last array
   //    endInLastArray) // end in last array
   //    {
   //       // shorter slice is fine
   //       // ab.log("fine, because end of results set");
   //       // should never occur - this would be scrolling that leads to a shorter set
   //       // should be caught before in cursorMove
   //       return slice;
   //    }
   //    else {
   //       // we need more results from another array
   //       if (arrayPosition[0] === suggestionsArrays.length - 1) {
   //          // the array we need isn't there yet
   //          // just log this for now
   //          ab.log("next array should be there, but isn't yet");
   //       }
   //       else {
   //          // ab.log("calling add from next array");
   //          return self.getAdditional();
   //       }
   //    }
   // } else {
   //    // console.log("slice big enough")
   //    return slice;
   // }
}



// incomplete
/* 
   Checks whether the new position within the locally cached results 
   necessitates the request of a previous/next slice of
   the results set
*/
function checkComfortZone(newPosition) {
   // ab.log("check cz", newPosition, arrayPosition[1]);
   var newArrayOffset = arrayPosition[1] + newPosition;

   // within the beginning comfort zone of an array, and no preceding array present
   if (newArrayOffset < comfortZone) {
      console.log("upper comofort zone, prevArrayexists: " + suggestionsArrays[arrayPosition[0] - 1] + " request already sent: " + previousSetRequested);
      if (!suggestionsArrays[arrayPosition[0] - 1] && !previousSetRequested) {
         // get preceding cut in results set
         // ab.log("implement get preceding cut");

         // if the present array is the first one in the full set, do nothing
         if( arrayCounter === 0 ) {
            console.log("first array in results set, returning");
            return;
         }

         // get the previous cut in the results set
         var set = {};
         // find the lowest id in the current array
         // var lowestId = getLowestId(suggestionsArrays[arrayPosition[0]]);
         // arrays now appear to be ordered, so just get the first id
         var lowestId = suggestionsArrays[arrayPosition[0]][0].id;

         set.before = lowestId;
         set.limit = limit;
         // ab.log("asking for preceding", selectValue, set);
         previousSetRequested = true;
         sess.call("api:search", selectValue, set).then(
            function(res) {
               previousSetRequested = false;
               // handle empty sets (needs to be fixed on the back end) - FIXME / REMOVE ME
               if (res.length === 0) {
                  ab.log("received empty set - backend problem");
                  return;
               }

               suggestionsArrays.unshift(res);
               // console.log("sugArLength " + suggestionsArrays.length);
               // console.log("maxSugArLength " + maxSuggestionsArraysLength);
               // cull the array at its end if necessary
               if (suggestionsArrays.length > maxSuggestionsArraysLength) {
                  // ab.log("culled at end ");
                  suggestionsArrays.splice(maxSuggestionsArraysLength - 1, 1);
                  // ab.log("current arrays", suggestionsArrays);
               }

               // increase the received counter
               // ab.log("increase counter");
               vm.receivedAutocompleteSuggestions(vm.receivedAutocompleteSuggestions() + res.length);
               // update the cache indicator
               var cacheSize = 0;
               for (var i = 0; i < suggestionsArrays.length; i++) {
                  cacheSize += suggestionsArrays[i].length;
               }
               vm.currentCacheSize(cacheSize);

            }, ab.log);

      }
   }
   // within the end comfort zone of an array, and no subsequent array present
   else if (newArrayOffset > ((suggestionsArrays[arrayPosition[0]].length - 1) - comfortZone)) {
      // ab.log("comfort bottom reached");
      if (!suggestionsArrays[arrayPosition[0] + 1] && !nextSetRequested) {
         console.log("no next array, and not requested yet");

         // if end in last received array do nothing
         if (endInLastArray) {
            return;
         }

         // get next cut in results set
         var set = {}; // FIXME: already defined!!
         // find the highest id in the current array
         // var highestId = getHighestId(suggestionsArrays[arrayPosition[0]]);
         // arrays now appear to be ordered, so just get the first id
         var currentArray = suggestionsArrays[arrayPosition[0]];
         var highestId = currentArray[currentArray.length - 1].id;


         set.after = highestId;
         set.limit = limit + 1;
         // ab.log("asking for", selectValue, set);
         // ab.log("asking for next array.")
         nextSetRequested = true;
         sess.call("api:search", selectValue, set).then(
            function(res) {
               nextSetRequested = false;
               // handle empty sets (needs to be fixed on the back end) - FIXME / REMOVE ME
               if (res.length === 0) {
                  endInLastArray = true;
                  return;
               }

               // check if end of results in current cut of results set
               if (res.length === limit + 1) {
                  res.splice(res.length - 1, 1); // cut results to limit size
                  endInLastArray = false;
               }
               else {
                  endInLastArray = true;
               }
               suggestionsArrays.push(res);
               // console.log("sugArLength " + suggestionsArrays.length);
               // console.log("maxSugArLength " + maxSuggestionsArraysLength);
               // cull the array at its beginning if necessary
               if (suggestionsArrays.length > maxSuggestionsArraysLength) {
                  // ab.log("culled at beginning");
                  suggestionsArrays.splice(0, 1);
                  // ab.log("current arrays", suggestionsArrays);
                  // adjust the arrayPosition, which is now one earlier in the array
                  arrayPosition[0] -= 1;
               }

               // increase the received counter
               // ab.log("increase counter");
               vm.receivedAutocompleteSuggestions(vm.receivedAutocompleteSuggestions() + res.length);
               // update the cache indicator
               var cacheSize = 0;
               for (var i = 0; i < suggestionsArrays.length; i++) {
                  cacheSize += suggestionsArrays[i].length;
               }
               vm.currentCacheSize(cacheSize);
            }, ab.log);
      }
   }
}

// works
/* 
   Evaluates the current content of the selection box
   Modifies it as needed for processing by the backend
   Sends requests for new autocomplete suggestions + 
   the size of the current results set   
*/
function onSelectorChanged() {
   // blank out the currently displayed details
   blankOutDetails(true);

   // reset the current matches
   vm.currentMatches(0);

   //cancelSubscriptions();

   // branching if empty string
   if (selectValue === "") {
      ab.log("select empty");
      updateSuggestions({ "display": false, "items": [] });
      vm.selectorEmpty(true);
      return;
   }
   else {
      vm.selectorEmpty(false);
   }

   // empty the suggestions list
   updateSuggestions({ "items": [] });

   // send request for suggestions to DB
   var offset = 0; // fresh set, so get from the start

   var set = {};
   //set.after = offset;
   set.after = 0; // hard-coded for now, FIXME
   set.limit = limit + 1;
   //ab.log("selectValue", selectValue);
   //ab.log("set", set);
   //sess.call("api:search", selectValue, set).then(function(res) { ab.log(res); }, ab.log);

   // filter any occurences of ',' from the selectValue
   // so that e.g. "einstein, albert" is equivalent to "einstein albert",
   // which the back-end uses as the searchable string
   if (selectValue.indexOf(',') !== -1) {
      var split = selectValue.split(',');
      var united = "";
      for (var i = 0; i < split.length; i++) {
         united += split[i];
      }
      selectValue = united;
      ab.log("United", selectValue);
   }

   //ab.log("ssent", selectValue, set);
   sess.call("api:search", selectValue, set).then(onNewSuggestions, ab.log);

   // in parallel: persons count for current string   
   sess.call("api:count", selectValue).then(function(count) {
      vm.currentMatches(count);
   }, ab.log);

   //sess.call("api:get-autocomplete-suggestions", selectField, selectValue, offset, limit + 1).then(onNewSuggestions, ab.log);

   // increase requests counter
   vm.requestsForAutocompleteSuggestions(vm.requestsForAutocompleteSuggestions() + 1);
}


// untested (not needed in current version)
//function cancelSubscriptions() {
//   // cancels any subscriptions for the item currently displayed in details

//   // needs states: current subscriptions
//   for (var i = 0; i < currentSubscriptions.length; i++) {
//      ab.log("unsubscribe");
//      //sess.unsubscribe(currentSubscriptions[i]);
//   }
//}

// works
/*
   Handles new autocomplete suggestions results set
   Checks whether the current set contains the entire results set
   Sends the relevant part of the set on to be displayed in the 
   suggestions box
*/
function onNewSuggestions(data) {
   // extract the id of the first item + send the RPC to get the details for this
   //ab.log("newsug", arguments);
   //examineMe = arguments;

   // catch special case: selector box empty, receive delayed suggestions from previously
   // sent search
   if (vm.selectorEmpty()) {
      return;
   }

   // catch special case: no selections since search string does not match on anything
   if (data.length === 0) {
      //ab.log("data", data);
      return;
   }

   var suggestions = data;
   //ab.log("suggestions", suggestions);
   var firstItemId = suggestions[0].id;
   requestItemDetails(firstItemId);
   currentItemId = firstItemId;

   // check if end of results in current cut of results set
   if (suggestions.length === limit + 1) {
      suggestions.splice(data.length - 1, 1); // cut results to limit size
      endInLastArray = false;
   }
   else {
      endInLastArray = true;
   }

   // store the items and set variables
   suggestionsArrays = []; // delete old cache
   suggestionsArrays[0] = suggestions;
   listPosition = 0;
   arrayPosition = [0, 0]; // no offset yet
   arrayCounter = 0; // first array in the entire set

   // increase the items counter
   // ab.log("increase counter");
   vm.receivedAutocompleteSuggestions(vm.receivedAutocompleteSuggestions() + suggestionsArrays[0].length);
   // update the cache indicator
   vm.currentCacheSize(suggestionsArrays[0].length);

   // initialize the suggestions box
   var itemsToDisplay = suggestionsArrays[0].slice(0, maxDisplay);
   var cs = {};
   cs.items = itemsToDisplay;
   cs.position = 0;
   cs.display = true;
   cs.above = false;
   if (suggestionsArrays[0].length > maxDisplay) {
      cs.below = true;
   }
   else {
      cs.below = false;
   }
   updateSuggestions(cs);

}

// works
function autoCompleteSuggestion(data) {
   return {
      name: data.name,
      id : data.id
   };
}


/************************************
 *        UI update functions       *
 ************************************/
// works
/* 
   Handles display & updates contents of the suggestions box
*/
function updateSuggestions(data) {
   // receives a dictionary containing:
   //    - suggestion list items ("items", optional)
   //    - current navigation position within the list ("position", optional)
   //    - toggle for display of "more above" and "more below" indicators ("above"/"below", optional)
   //    - toggle for display of the box ("display", optional)
   // fully empty dict 
   //ab.log("update suggestions", data);


   // fill box with suggestion items
   if ("items" in data) {
      // clear old data
      vm.autocompleteSuggestions([]);
      // add new data
      var items = data.items;

      if (items.length > 0) {

         for (var i = 0; i < items.length; i++) {
            vm.autocompleteSuggestions.push(new autoCompleteSuggestion(items[i]));
         }
      }
   }

   // toggle display of moreAbove & moreBelow indicators
   if ("above" in data && data.above === true) {
      $("#moreAbove").show(20);
   }
   if ("above" in data && data.above === false) {
      $("#moreAbove").hide(20);
   }
   if ("below" in data && data.below === true) {
      $("#moreBelow").show(20);
   }
   if ("below" in data && data.below === false) {
      $("#moreBelow").hide(20);
   }

   // toggle display of box
   if ("display" in data && data.display === true) {
      $("#autocompleteBox").show(300);
   }
   if ("display" in data && data.display === false) {
      $("#autocompleteBox").hide(300);
   }

   // move the highlighting
   if ("position" in data) {
      var listItems = $("#suggestionsList").children("li");
      var position = data.position;


      for (var i = 0; i < listItems.length; i++) {

         if (i === position) {
            $(listItems[i]).addClass("highlighted");
         }
         else {
            if ($(listItems[i]).has(".highlighted")) {
               $(listItems[i]).removeClass("highlighted");
            }
         }
      }
   }
}

// works
function updateDetails(data) {
   //ab.log("upd called");
   examineMe = data;
   // receives a single dictionary with the keys listed below in dataMap

   // change back from greyed out state
   vm.detailsGreyedOut(false);

   // mapping of the dictionary keys to observables in the details view
   var dataMap = {
      "name": vm.name,
      "birthdate": vm.birthdate,
      "birthplace": vm.birthplace,
      "deathdate": vm.deathdate,
      "deathplace": vm.deathplace,
      "descr": vm.descr
   };
   //ab.log("dmap", dataMap, "data", data);

   // format the dates
   if (data.birthdate !== "") {
      var birthDate = new Date(data.birthdate.replace(/-/g, '/').replace(/T/, ' ').replace(/\+/, ' +'));
      var birthDateFormatted = birthDate.getFullYear() + "-" + (birthDate.getMonth() + 1) + "-" + birthDate.getDate();
      data.birthdate = birthDateFormatted;
   }
   if (data.deathdate !== "") {
      var deathDate = new Date(data.deathdate.replace(/-/g, '/').replace(/T/, ' ').replace(/\+/, ' +'));
      var deathDateFormatted = deathDate.getFullYear() + "-" + (deathDate.getMonth() + 1) + "-" + deathDate.getDate();
      data.deathdate = deathDateFormatted;
   }


   // update the observables bound to the data display fields
   for (var key in dataMap) {
      //ab.log(key);
      if (dataMap.hasOwnProperty(key)) {
         (dataMap[key])(data[key]);
      }
   }

}

// works
function blankOutDetails(greyOut) {
   // no args since there is currently only one details view to operate on
   // send empty details set to clear fields
   var emptyDetails = {
      "name": "",
      "birthdate": "",
      "birthplace": "",
      "deathdate": "",
      "deathplace": "",
      "descr": ""
   };
   updateDetails(emptyDetails);

   // grey out the details display areas
   if (greyOut) {
       vm.detailsGreyedOut(true);
   }
}


////////////////////// not current ///////////////////////

// obsolete, since arrays are now ordered by id
function getLowestId(currentArray) {
   var lowestId = currentArray[0].id; // could be any id from currentArray
   for (var i = 0; i < currentArray.length; i++) {
      if(currentArray[i].id < lowestId) {
         lowestId = currentArray[i].id;
      }
   }
   return lowestId;
}

// obsolete, since arrays are now ordered by id
function getHighestId(currentArray) {
   var highestId = 0;
   for (var i = 0; i < currentArray.length; i++) {
            if (currentArray[i].id > highestId) {
               highestId = currentArray[i].id;
            }
   }
   return highestId;
}

// for testing
function listArrayIds(currentArray) {
   for(var i = 0; i < currentArray.length; i++) {
      console.log(i + ": ", currentArray[i].id);
   }
}




//
   //
   // test events and data
   //
//

function t_initialize() {
   updateDetails(t_testData[0]);
   updateSuggestions(t_updateTest_01);
}

function t_sortData(data, key, selectString) {
   //ab.log("sort", data, key, selectString);

   // handle empyt selectString
   if (selectString === "") {
      var data = {
         "name": "",
         "customerNumber": "",
         "street": "",
         "zipcode": "",
         "city": "",
         "phone": "",
         "email": "",
         "twitterHandle": ""
      };
      //fillFields(data);
   }

   // sort through the array of test data and create array of matching entries
   var matchingData = [];

   for (var i = 0; i < data.length; i++) {
      var compareString = data[i][key].slice(0, selectString.length);
      if (compareString === selectString) {
         matchingData.push(data[i]);
      }
   }
   //ab.log(matchingData);
   //fillFields(matchingData[0]);

   // take the names from the first up to five of these for display below the box

}

var t_testData = [
   { "name": "Henry Ford", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord", "characterCount": "134568990", "lastTweet": "Hello World! Twitter's new usage guidelines suck" },
   { "name": "Henry Chinaski", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "Henry VIII", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "Harald", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "Henry Fnord", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "Henry Xinaski", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "Henry V", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "Harald_02", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "Henry Henry", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "Henry Dinaski", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "Henry II", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "Harald_03", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "Henry Ord", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "Henry Aski", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "Henry I", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "Harald_04", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" }
];
var t_testData2 = [
   { "name": "0", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "1", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "2", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "3", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "4", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "5", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "6", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "7", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "8", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "9", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "10", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "11", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "12", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "13", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "14", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "15", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "0", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "1", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "2", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "3", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "4", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "5", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "6", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "7", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "8", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "9", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "10", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "11", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "12", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "13", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "14", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "15", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "0", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "1", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "2", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "3", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "4", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "5", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "6", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "7", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "8", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "9", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "10", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "11", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "12", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "13", "customerNumber": "000002", "street": "Gin Lane 666", "zipcode": "475889", "city": "Los Angeles", "phone": "421-345-7890", "email": "---", "twitterHandle": "wastedWriter" },
   { "name": "14", "customerNumber": "000007", "street": "Buckingham Palace 1", "zipcode": "345621", "city": "London", "phone": "123-456-7890", "email": "king@uk.gov", "twitterHandle": "lookingForWives" },
   { "name": "15", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" },
   { "name": "0", "customerNumber": "000001", "street": "Motor Avenue 13", "zipcode": "456789", "city": "Detroit", "phone": "313-555-3456", "email": "henry@ford-motor.com", "twitterHandle": "theOriginalFord" },
   { "name": "15", "customerNumber": "000004", "street": "Mud Road 1", "zipcode": "000000", "city": "the one in the next fjord", "phone": "----", "email": "----", "twitterHandle": "---" }
];



var t_updateTest_01 = {
   "above": true,
   "below": false,
   "position": 0,
   "display": true,
   "items": [
      ["Henry Ford",  "00FGH"],
      ["Henry Chinaski",  "34dFGH" ],
      ["Henry VIII",  "23dFGH"],
      ["Harald",  "24dfGH"],
      ["Henry Fnord",  "2000GH"],
      ["Harald_03",  "2cxdfH"],
      ["Henry I",  "7asGH"]]
};
var t_updateTest_02 = {
   "above": false,
   "below": true,
   "position": 5,
   "items": [
      ["Henry Ford", "00FGH"],
      ["Henry Chinaski", "34dFGH"],
      ["Henry VIII", "23dFGH"],
      ["Harald", "24dfGH"],
      ["Henry Fnord", "2000GH"],
      ["Harald_03", "2cxdfH"],
      ["Henry I", "7asGH"]]
};
var t_updateTest_03 = {
   "display": false
};

var t_suggestionsTestSet = [
      ["TEST NEW SUGGESTIONS ADDED", "00FGH"],
      ["Henry Chinaski", "34dFGH"],
      ["Henry VIII", "23dFGH"],
      ["Harald", "24dfGH"],
      ["Henry Fnord", "2000GH"],
      ["Harald_03", "2cxdfH"],
      ["Henry I", "7asGH"]
];
var t_suggestionsTestSet_2 = [
      ["TEST NEW SUGGESTIONS ADDED", "00FGH"],
      ["Henry Chinaski", "34dFGH"],
      ["Henry VIII", "23dFGH"],
      ["Harald", "24dfGH"],
      ["Henry Fnord", "2000GH"],
      ["Harald_03", "2cxdfH"],
      ["Henry I", "7asGH"],
      ["TEST NEW SUGGESTIONS ADDED", "00FGH"],
      ["Henry Chinaski", "34dFGH"],
      ["Henry VIII", "23dFGH"],
      ["Harald", "24dfGH"],
      ["Henry Fnord", "2000GH"],
      ["Harald_03", "2cxdfH"],
      ["Henry I", "7asGH"]
];

function t_init_comfort(arrayNumber, array, arrayPos, newPosition ) {
   arrayPosition[1] = arrayPos;
   arrayPosition[0] = array;

   suggestionsArrays = [];
   for (var i = 0; i < arrayNumber; i++) {
      suggestionsArrays[i] = t_testData2;
   }

   checkComfortZone(newPosition);

}

var t_getSuggestionsItemSet_testSet = [
   [
      ["a", "00FGH"],
      ["b", "34dFGH"],
      ["c", "23dFGH"],
      ["d", "24dfGH"],
      ["e", "2000GH"],
      ["f", "2cxdfH"],
      ["g", "7asGH"],
      ["h", "00FH"],
      ["i", "34FGH"],
      ["j", "2dFGH"],
      ["k", "24fGH"],
      ["l", "200GH"],
      ["m", "cxdfH"],
      ["n", "7aH"],
      ["o", "FGH"],
      ["p", "dFGH"],
      ["q", "2GH"],
      ["r", "4dfGH"],
      ["s", "0GH"],
      ["t", "fH"],
      ["u", "H"]
   ],
   [
      ["1", "FGH"],
      ["2", "2234dFGH"],
      ["3", "2dd3dFGH"],
      ["4", "24dddfGH"],
      ["5", "2000GddH"],
      ["6", "2cxdfddH"],
      ["7", "7addsGH"],
      ["1a", "00FddGH"],
      ["2a", "34ddFGH"],
      ["3a", "23dddFGH"],
      ["4a", "24rrrdfGH"],
      ["5a", "200rrrr0GH"],
      ["6a", "2cxdrrrfH"],
      ["7a", "7asrrrGH"],
      //["1b", "00FrrrGH"],
      //["2b", "34drrrFGH"],
      //["3b", "23drrrFGH"],
      //["4b", "24dfrrrGH"],
      //["5b", "200rrr0GH"],
      //["6b", "2crrrxdfH"],
      //["7b", "7asrrrGH"],
      //["1c", "00FrrrGH"],
      //["2c", "34rrrdFGH"],
      //["3c", "23drrFGH"],
      //["4c", "24dfrGH"],
      //["5c", "20r00GH"],
      //["6c", "2cxrdfH"],
      //["7c", "7arsGH"],
      //["1d", "00FrGH"],
      //["2d", "34dFrGH"],
      //["3d", "23dFGrH"],
      //["4d", "24dfGrH"],
      //["5d", "2000GHa"],
      //["6d", "2cxdfaH"],
      //["7d", "7asGaH"]
   ]
];

function t_getSuggestionsItemSet_test(array0, array1, maxDis, endIn) {
   suggestionsArrays = t_getSuggestionsItemSet_testSet;
   arrayPosition[0] = array0;
   arrayPosition[1] = array1;
   maxDisplay = maxDis;
   endInLastArray = endIn;
   return getSuggestionsItemSet();
}

function t_cursorTest() {
   arrayPosition[0] = 0;
   arrayPosition[1] = 0;
   arrayCounter = null;
   //endInLastArray = false;
   limit = 20;
   comfortZone = 5;
   listPosition = 0;
   maxDisplay = 5;
   onNewSuggestions(t_getSuggestionsItemSet_testSet[0]);
   suggestionsArrays = t_getSuggestionsItemSet_testSet;
   endInLastArray = true;
}