/******************************************************************************
 *
 * Copyright (c) 2012-2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
 *
 ******************************************************************************/

// WAMP session object
var session = null;

// KnockoutJS viewmodel
var vm = null;


// Application entry point
//
$(document).ready(function () {

   // Instantiate and bind the viewmodel
   vm = new ViewModel();
   ko.applyBindings(vm);

   $("#helpButton").click(function() {
      $(".info_bar").toggle();
   });

   $('#new-window').attr('href', window.location.pathname);

   // Connect to Tavendo WebMQ
   connect();
});


// Connect to Tavendo WebMQ
//
function connect() {

   ab.Deferred = jQuery.Deferred;
   //ab.debug(true, true, true);

   // Get Tavendo WebMQ WebSocket URL (we also provide a fallback URL)
   var wsuri = getWebMQURL("ws://localhost/ws");

   ab.connect(wsuri,

      // connection established handler
      function (newSession) {
         session = newSession;
         onConnect();
      },

      // connection lost handler
      function (code, reason, detail) {
         session = null;
         updateStatusline(reason);
      }
   );
}


// Fired when connection to Tavendo WebMQ was established
//
function onConnect () {
   // Authenticate as anonymous ..
   session.authreq().then(function () {
      session.auth().then(onAuthenticated, ab.log);
   }, ab.log);
}


// Fired when session was authenticated to Tavendo WebMQ
//
function onAuthenticated (permissions) {
   updateStatusline("Connected and authenticated to " + session.wsuri() + " in session " + session.sessionid());

   // setup some URI prefixes
   session.prefix("event", "http://tavendo.de/webmq/demo/koform#");
   session.prefix("api", "http://tavendo.de/webmq/demo/koform#");

   // send request for initial data cut from DB
   // fill grid with this data
   session.call("api:read", {start: 0, limit: 100}).then(fillList, ab.log); // if no start & limit: start: 1, limit: 10

   // subscribe to data change events
   session.subscribe("event:oncreate", onItemCreated);
   session.subscribe("event:onupdate", onItemUpdated);
   session.subscribe("event:ondelete", onItemDeleted);
}


function updateStatusline (status) {
   document.getElementById("statusline").innerHTML = status;
}


function fillList (res) {
   for (var i = 0; i < res.length; i++) {
      vm.listData.push(new listItem(res[i]));
   }
   // set focus to first list element
   vm.displayDetails(vm.listData()[0]);
}


function onItemCreated (uri, obj) {
   vm.listData.push(new listItem(obj));

   // highlight this for a short while
   var index = getIndexFromId(obj.id);
   vm.listData()[index].itemState("hasBeenCreated");
   window.setTimeout(function() { vm.listData()[index].itemState(''); }, 1000);
}


function onItemUpdated (uri, obj) {
   var index = getIndexFromId(obj.id);

   // update locally stored values that habe been updated remotely
   for (var i in obj) {
      if(obj.hasOwnProperty(i)) {
         vm.listData()[index][i](obj[i]);
      }
   }

   // update the details view if this shows the updated item
   if (vm.detailsCurrent.id() === obj.id) {

      vm.displayDetails(vm.listData()[index]);

      // temporary highlighting of the changed details
      for (var i in obj) {
         if (obj.hasOwnProperty(i) && i != "id" ){
            vm.detailsEditable.hasBeenEdited[i](true);
            (function(it) {
                  window.setTimeout(function() {
                        vm.detailsEditable.hasBeenEdited[it](false);
                  }, 1400);
            })(i);
         }
      }
   }

   // temporary highlighting of the list item
   var previousItemState = vm.listData()[index].itemState();
   vm.listData()[index].itemState("hasBeenEdited");
   window.setTimeout(function() { vm.listData()[index].itemState(previousItemState); }, 1400);
}


function onItemDeleted (uri, obj) {
   // highlight item, then delete
   var index = getIndexFromId(obj.id);
   vm.listData()[index].itemState("isBeingDeleted");

   window.setTimeout(function() {
      var fadeTime = 200;
      // fade out item
      vm.listData()[index].itemState("nonDisplay");
      // set timeout to delete item after end of fade
      window.setTimeout(function() {
         var locallyDeleted = uri === "localDelete" ? true : false;
         vm.deleteListItemLocal(index, locallyDeleted);
      }, fadeTime);
   }, 1400);
}


function getIndexFromId (id) {
   var index;
   for (var i = 0; i < vm.listData().length; i++) {
      if (vm.listData()[i].id() === id) {
         index = vm.listData()[i].index();
      }
   }
   return index;
}


function ViewModel () {

   //track an index on items in an observableArray
   ko.observableArray.fn.indexed = function(prop) {
      prop = prop || 'index';
      //whenever the array changes, make one loop to update the index on each
      this.subscribe(function(newValue) {
         if (newValue) {

            var item;
            for (var i = 0, j = newValue.length; i < j; i++) {
               item = newValue[i];
               if (!ko.isObservable(item[prop])) {
                  item[prop] = ko.observable();
               }
               item[prop](i);
            }
         }
      });

      //initialize the index
      this.valueHasMutated();
      return this;
   };

   var self = this;

   this.listData = ko.observableArray([]).indexed('index');

   // details editable observables

   self.detailsEditable = {
      "index": ko.observable(),
      "orderNumber": ko.observable(),
      "name": ko.observable(),
      "weight": ko.observable(),
      "size": ko.observable(),
      "inStock": ko.observable(),
      "price": ko.observable(),
      "itemState": ko.observable(),
      "fieldValueChanged": {
         "orderNumber": ko.observable(false),
         "name": ko.observable(false),
         "weight": ko.observable(false),
         "size": ko.observable(false),
         "inStock": ko.observable(false),
         "price": ko.observable(false),
         "counter": ko.observable(0)
      },
      "hasBeenEdited": {
         "orderNumber": ko.observable(false),
         "name": ko.observable(false),
         "weight": ko.observable(false),
         "size": ko.observable(false),
         "inStock": ko.observable(false),
         "price": ko.observable(false)
      }
   };

   self.addButtonVisible = ko.observable(true);
   self.deleteButtonVisible = ko.observable(true);
   self.saveButtonVisible = ko.observable(false);
   self.cancelButtonVisible = ko.observable(false);
   self.switchWarning = ko.observable(false);
   self.orderNumberMissing = ko.observable(true);
   self.nameMissing = ko.observable(true);

   self.detailsCurrent = null;
   self.detailsPrevious = null;

   self.detailsIds = ["index", "orderNumber", "name", "price", "weight", "size", "inStock"];

   self.switchingBlocked = false;

   self.focusOnOrderNumber = ko.observable(true);


   self.inputs = { "orderNumber": "string", "name": "string", "price": "num", "weight": "num", "size": "num", "inStock": "num" };

   this.mangleInputs = function(viewmodel, event) {
      // filter out non-numeric inputs on numeric input fields
      if (self.inputs[event.target.id] === "num") {
         // ab.log("evt", event.keyCode);
         if (event.keyCode > 57 && event.keyCode !== 190) {
            return false;
         }
      }
      return true; // knockout.js otherwise prevents the default action
   };

   this.checkForValueChange = function(viewmodel, event) {
      //self.exevent = event;
      //ab.log("checking", viewmodel, event.target.value, event.target.id);
      var valueId = event.target.id;
      var currentValue = event.target.value;
      // ab.log("vId", valueId, "cv", currentValue);
      // convert to number on number fields before comparison
      if (self.inputs[valueId] === "num") {
         currentValue = parseFloat(currentValue, 10);
      }

      var storedValue = self.detailsCurrent[valueId]();

      if (currentValue !== storedValue && self.detailsEditable.fieldValueChanged[valueId]() === false) {
         self.detailsEditable.fieldValueChanged[valueId](true);
         self.detailsEditable.fieldValueChanged.counter( self.detailsEditable.fieldValueChanged.counter() + 1);
      }
      else if (currentValue === storedValue && self.detailsEditable.fieldValueChanged[valueId]() === true) {
         self.detailsEditable.fieldValueChanged[valueId](false);
         self.detailsEditable.fieldValueChanged.counter(self.detailsEditable.fieldValueChanged.counter() - 1);
      }

      // check whether the required data is present
      if (valueId === "name" && currentValue === "") {
         self.nameMissing(true);
      }
      else if (valueId === "name" && currentValue !== "") {
         self.nameMissing(false);
      }
      if (valueId === "orderNumber" && currentValue === "") {
         self.orderNumberMissing(true);
      }
      else if (valueId === "orderNumber" && currentValue !== "") {
         self.orderNumberMissing(false);
      }

      // switch buttons based on whether there have been changes and all required data present
      if (self.orderNumberMissing() === false && self.nameMissing() === false && self.detailsEditable.fieldValueChanged.counter() > 0) {
         //ab.log("ok");
         self.saveButtonVisible(true);
         self.cancelButtonVisible(true);
      }
      else if (self.detailsEditable.fieldValueChanged.counter() > 0) {
         self.cancelButtonVisible(true);
         self.saveButtonVisible(false);
      }
      else {
         self.saveButtonVisible(false);
         self.cancelButtonVisible(false);
         self.switchWarning(false);
      }

   };

   this.switchDetailsDisplayed = function(listItem, event) {
      // check whether switching currently blocked
      if (self.switchingBlocked === false) {

         // new item and no data entered yet
         if (self.detailsCurrent.itemState() === "isNew" && self.detailsEditable.fieldValueChanged.counter() === 0) {
            // switch & delete the new item, no notification sent
            self.listData.splice(-1, 1);
            self.displayDetails(listItem, event);
         }
            // no data changed
         else if (self.detailsEditable.fieldValueChanged.counter() === 0) {
            self.displayDetails(listItem, event);
         }
            // changes that would be lost on switch
         else {
            self.switchWarning(true);
         }
      }
   };

   this.displayDetails = function(listItem, event) {

      self.clearDetailsChanged();
      self.switchWarning(false);

      // copy the observables to the details editable observables
      for (var i = 0; i < self.detailsIds.length; i++) {
         self.detailsEditable[self.detailsIds[i]](listItem[self.detailsIds[i]]());
      }

      // reset the field states - IMPLEMENT ME

      // copy the entire object to the details current
      self.detailsCurrent = listItem;

      // switch highlighting to displayed
      if (self.detailsCurrent.itemState() !== 'isNew') {
         self.detailsCurrent.itemState('isBeingDisplayed');
      }

      // if previously highlighted item !== current item, and not shown as being deleted, remove highlighting
      if (self.detailsPrevious && self.detailsPrevious.index() !== self.detailsCurrent.index() && self.detailsPrevious.itemState() !== "isBeingDeleted") {
         self.detailsPrevious.itemState('');
      }
      self.detailsPrevious = self.detailsCurrent;

      // self.focusOnOrderNumber(true); // browser scrolls if focussed element not in view - FIXME

      // cancel display of the details buttons
      self.cancelButtonVisible(false);
      self.saveButtonVisible(false);

      // hide the required stars
      self.orderNumberMissing(false);
      self.nameMissing(false);

   };

   this.normalizeSet = function(set) {
      for (var i in set) {
         // backend expects numerical values for certain fields
         // either parse to numerical, or remove field from save set
         if (self.inputs[i] === "num" && set[i] !== "") {
            set[i] = parseFloat(set[i], 10);
         }
         else if (self.inputs[i] === "num" && set[i] === "") {
            delete set[i];
         }
      }
      return set;
   };

   this.saveDetailsEdits = function() {

      // block from switching before the call has returned
      self.switchingBlocked = true;

      // switch based on need to create new item or modification of existing one
      if (self.detailsCurrent.itemState() === 'isNew') {

         var saveSet = {};
         for (var i in self.inputs) {
            saveSet[i] = self.detailsEditable[i]();
         }

         self.normalizeSet(saveSet);
         console.log("saveSet ", saveSet);

         session.call("api:create", saveSet).then(
            function(res) {

               //// use return from DB for this
               for (var i in res) {
                  self.detailsCurrent[i](res[i]);
               }

               // write the id received from the server
               self.detailsCurrent["id"](res["id"]);
               // unblock switching
               self.switchingBlocked = false;
               // set item state
               self.detailsCurrent.itemState('isBeingDisplayed');
               // display details to clear field states + set button states
               self.displayDetails(self.listData()[self.detailsCurrent.index()]);
               // re-enable the 'add item' button
               self.addButtonVisible(true);
            },
            ab.log
            );
      }
      else {
         var updateSet = {};

         updateSet["id"] = self.detailsCurrent["id"]();
         for (var i in self.inputs) {
            if (self.detailsEditable.fieldValueChanged[i]() === true) {
               updateSet[i] = self.detailsEditable[i]();
            }
         }

         self.normalizeSet(updateSet);

         session.call("api:update", updateSet).then(
            function(res) {

               for (var i in res) {
                  self.detailsCurrent[i](res[i]);
               }
               // unblock switching
               self.switchingBlocked = false;

               // display details to clear field states + set button states
               self.displayDetails(self.listData()[self.detailsCurrent.index()]);
            },
            ab.log
            );
      }
   };

   this.cancelDetailsEdits = function() {
      // check whether this is a new item
      if (self.detailsCurrent.itemState() === 'isNew') {
         // delete item from list
         self.listData.splice(self.detailsCurrent.index(), 1);
         // set focus to top of the list and display the details for this
         self.displayDetails(self.listData()[0]);
         // re-enable the 'add item' button
         self.addButtonVisible(true);
      }
      else {
         self.displayDetails(self.listData()[self.detailsCurrent.index()]);
      }
   };

   this.addListItem = function() {
      // block the 'add item' button
      self.addButtonVisible(false);

      // add empty item to list
      var newItem = {
         "orderNumber": "",
         "name": "",
         "weight": "",
         "size": "",
         "inStock": "",
         "itemState": "isNew", // FIXME
         "price": ""
      };
      self.listData.push(new listItem(newItem));
      //set itemState (hack, no idea why the regular set as part of newItem not working - FIXME
      var listLength = self.listData().length;
      self.listData()[listLength - 1].itemState("isNew");

      // display the change
      self.displayDetails(self.listData()[listLength - 1]);

      // set the button states on the details view
      self.cancelButtonVisible(true);
      //self.saveButtonVisible(true); // not until something has been entered

      self.orderNumberMissing(true);
      self.nameMissing(true);
   };

   this.deleteListItem = function( listItem, event ) {
      session.call("api:delete", listItem.id()).then(
         function(res) {
            var index = listItem.index();
            // delete the item
            onItemDeleted("localDelete", {id: listItem.id()});
         },
         ab.log
         );
   };

   this.deleteListItemLocal = function( index, locallyDeleted ) {

      var changeFocus = true;

      if ( !locallyDeleted  ) {
         // check whether any other element is in focus or if we need to focus a new element         
         var focussedElementExists = false;
         for (var i = 0; i < self.listData().length; i++ ) {
            if (self.listData()[i].itemState() === "isBeingDisplayed") {
               focussedElementExists = true;
            }
         }
         changeFocus = focussedElementExists ? false : true;
      }

      self.listData.splice(index, 1); // splice without listData(), since otherwise no ko refresh triggered

      if (changeFocus) {
         // check if list elements left after delete, if yes set focus to one of them
         var newFocus = false;
         if (self.listData().length > 0) {
            newFocus = index < self.listData().length - 1 ? index : self.listData().length - 1;
         }

         // switch to list element or to blank view
         if (newFocus !== false) {
            self.displayDetails(self.listData()[newFocus]);
            self.clearDetailsChanged();
         }
         else {
            // clear the details view
            // detailsCurrent already gone --> referenced object deleted
            for (var i in self.detailsEditable) {
               // check whether regular value and set to blank
               if (self.detailsEditable.hasOwnProperty(i) && typeof (self.detailsEditable[i]) === "function") {
                  self.detailsEditable[i]("");
               }
            }
            // clear the details changed state
            self.clearDetailsChanged();
         }
      }
   };

   this.clearDetailsChanged = function() {
      //ab.log("clearing details");
      var fieldValueChanged = self.detailsEditable.fieldValueChanged;
      // reset all changed values to false
      for (var i in fieldValueChanged) {
         if (fieldValueChanged.hasOwnProperty(i)) {
            fieldValueChanged[i](false);
         }
      }
      // reset the counter to 0
      fieldValueChanged.counter(0);
   };
}


function listItem (data) {
   return {
      orderNumber: ko.observable(data["orderNumber"]),
      name: ko.observable(data["name"]),
      price: ko.observable(data["price"]),
      weight: ko.observable(data["weight"]),
      size: ko.observable(data["size"]),
      inStock: ko.observable(data["inStock"]),
      id: ko.observable(data["id"]),
      itemState: ko.observable()
   };
}

function addTestItems (numberOfItemsToAdd) {

   for ( var i = 0; i < numberOfItemsToAdd + 1; i++ ) {
      // create item to send
      var saveSet = { inStock: i, name: "Test Item " + i, orderNumber: "TT-" + i, price: i*3.5, size: i +4, weight: i*1.3+40 };
      session.call("api:create", saveSet).then(
         function(res) {
            // ab.log("saved", res);
         },
         ab.log
      );
   }
}

var oracleForm = {};

oracleForm.testEvents = function(evt, rep) {
   switch(evt) {
      case "create":
         rep = !rep ? 1 : rep;
         for( var i = 0; i < rep; i++) {
            console.log("constructing", i);
            var saveSet = { inStock: i, name: "Test Item " + i, orderNumber: "TT-" + i, price: i*3.5, size: i +4, weight: i*1.3+40 };
            vm.normalizeSet(saveSet);
            session.call("api:create", saveSet).then(ab.log, ab.log);
         }
         break;
      case "delete":
         // console.log("no deleting yet");
         var items;
         session.call("api:filter", {name: {type: "prefix", value: "test" }}, 500).then(function(obj) {
            for(var i = 0; i < rep; i++) {
               if(obj[i]) {
                  // var index = getIndexFromId(obj[i].id);
                  console.log("id ", obj[i].id);
                  session.call("api:delete", obj[i].id).then(
                     function(res) {
                        // delete the item
                        onItemDeleted("localDelete", obj[i].id);
                     },
                     ab.log
                  );
               }
            }
         }, ab.log);

         break;
      case "update":
         // console.log("no update yet");
         var items;
         session.call("api:filter", {name: {type: "prefix", value: "test" }}, 500).then(function(obj) {
            for(var i = 0; i < rep; i++) {
               if(obj[i]) {
                  // var index = getIndexFromId(obj[i].id);
                  console.log("id ", obj[i].id);
                  var updated = { id: obj[i].id, orderNumber: "updated " + i*rep};
                  session.call("api:update", updated).then(ab.log, ab.log);
               }
            }
         }, ab.log);
         break;
      default:
         break;
   }
};
