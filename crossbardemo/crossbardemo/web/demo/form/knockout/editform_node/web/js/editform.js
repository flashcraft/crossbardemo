// the URL of the WAMP Router (Crossbar.io)
//
var wsuri;
if (document.location.origin == "file://") {
   wsuri = "ws://127.0.0.1:8080/ws";

} else {
   wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
            document.location.host + "/ws";
}

// WAMP session object
var session = null;

// KnockoutJS viewmodel
// Instantiate and bind the viewmodel
var vm = new ViewModel();
ko.applyBindings(vm);


// the WAMP connection to the Router
//
var connection = new autobahn.Connection({
   url: wsuri,
   realm: "realm1"
});


document.getElementById("helpButton").addEventListener("click", function() {
   console.log("helpButton clicked");
   document.getElementsByClassName("info_bar")[0].classList.toggle("displayed");
   console.log(document.getElementsByClassName("info_bar")[0]);
});

// fired when connection is established and session attached
//
connection.onopen = function (sess, details) {

   console.log("Connected");

   session = sess;

   // $('#new-window').attr('href', window.location.pathname);
   document.getElementById('secondInstance').setAttribute('href', window.location.pathname);

   updateStatusline("Connected to " + wsuri + " in session " + session.id);

   // set an URI prefix
   session.prefix("form", "io.crossbar.crossbar.demo.product");

   // request full data set initially and fill grid
   session.call("form:read", [], {start: 0, limit: 25}).then(vm.fillList, session.log);

   // subscribe to data change events
   session.subscribe("form:oncreate", vm.onItemCreated);
   session.subscribe("form:onupdate", vm.onItemUpdated);
   session.subscribe("form:ondelete", vm.onItemDeleted);
   session.subscribe("form:onreset", vm.onDataReset);

   // test subscribe to meta events
   session.subscribe("wamp.metaevent.session.on_leave", function() {
      console.log("session.on_leave", arguments);
   });

};


// fired when connection was lost (or could not be established)
//
connection.onclose = function (reason, details) {
   console.log("Connection lost: " + reason, details);
}


// now actually open the connection
//
connection.open();

// should use KO and be part of the VM
function updateStatusline (status) {
   console.log("updateStatusline", status);
   document.getElementById("statusline").innerHTML = status;
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


   /*****************************************************
   *  definition of our observables and other variables *
   *****************************************************/

   this.listData = ko.observableArray([]).indexed('index');

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

   self.displayResetNotice = ko.observable(false);

   self.inputs = { "orderNumber": "string", "name": "string", "price": "num", "weight": "num", "size": "num", "inStock": "num" };

   


   self.mangleInputs = function(viewmodel, event) {
      // filter out non-numeric inputs on numeric input fields
      if (self.inputs[event.target.id] === "num") {
         // session.log("evt", event.keyCode);
         if (event.keyCode > 57 && event.keyCode !== 190) {
            return false;
         }
      }
      return true; // knockout.js otherwise prevents the default action
   };

   self.checkForValueChange = function(viewmodel, event) {
      // can be called before the initial loading of items, or on empyt lists,
      // i.e. when there are no values to compare to
      // should handle this - FIXME
      if (!self.detailsCurrent) {
         return;
      }
      console.log("checkForValueChange");


      //self.exevent = event;
      //session.log("checking", viewmodel, event.target.value, event.target.id);
      var valueId = event.target.id;
      var currentValue = event.target.value;
      // session.log("vId", valueId, "cv", currentValue);
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
         //session.log("ok");
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

   self.switchDetailsDisplayed = function(listItem, event) {
      console.log("switchDetailsDisplayed", listItem, event);

      // check whether switching currently blocked
      if (self.switchingBlocked === false) {

         // new item and no data entered yet
         if (self.detailsCurrent.itemState() === "isNew" && self.detailsEditable.fieldValueChanged.counter() === 0 && listItem.itemState() !== "isNew") {
            // additionally need to check that we're not clicking inside the new item
            // processing this as a focus switch is unexpected behavior

            // switch & delete the new item, no notification sent
            self.listData.splice(-1, 1);
            self.displayDetails(listItem, event);

            self.addButtonVisible(true);
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

   self.displayDetails = function(listItem, event) {

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

      self.focusOnOrderNumber(true); // browser scrolls if focussed element not in view!

      // cancel display of the details buttons
      self.cancelButtonVisible(false);
      self.saveButtonVisible(false);

      // hide the required stars
      self.orderNumberMissing(false);
      self.nameMissing(false);

   };

   self.normalizeSet = function(set) {
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

   self.saveDetailsEdits = function() {

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

         session.call("form:create", [], saveSet, { disclose_me: true }).then(
            function(res) {

               console.log("created", res);
               delete res['_eventId'];

               //// use return from DB for this
               for (var i in res) {
                  if (res.hasOwnProperty(i)) {
                     self.detailsCurrent[i](res[i]);   
                  }                  
               }

               // write the id received from the server
               // self.detailsCurrent["id"](res["id"]); ??? - should be covered by the above
               // unblock switching
               self.switchingBlocked = false;
               // set item state
               self.detailsCurrent.itemState('isBeingDisplayed');
               // display details to clear field states + set button states
               self.displayDetails(self.listData()[self.detailsCurrent.index()]);
               // re-enable the 'add item' button
               self.addButtonVisible(true);
            },
            session.log
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

         session.call("form:update", [], updateSet, { disclose_me: true }).then(
            function(res) {
               console.log("updated", res);
               delete res['_eventId'];

               for (var i in res) {
                  self.detailsCurrent[i](res[i]);
               }
               // unblock switching
               self.switchingBlocked = false;

               // display details to clear field states + set button states
               self.displayDetails(self.listData()[self.detailsCurrent.index()]);
            },
            session.log
            );
      }
   };

   self.cancelDetailsEdits = function() {
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

   self.addListItem = function() {
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

   // delete triggered locally via delete button on list item
   self.triggerDelete = function( listItem, event ) {
      session.call("form:delete", [listItem.id()], {}, { disclose_me: true }).then(
         function(res) {
            // console.log("item " + listItem.id() + " deleted on backend", res);
            var locallyTriggered = true;
            self.deleteListItem(listItem, locallyTriggered);
         },
         session.log // we should really have some error handling here - FIXME!
         );
   };

   self.deleteListItem = function (item, locallyTriggered) {

      item.itemState("isBeingDeleted");

      var timeout = locallyTriggered === true ? 500 : 1500;

      window.setTimeout(function() {
         // fade out item - CHECKME!
         item.itemState("nonDisplay");
         // set timeout to delete item after end of fade
         window.setTimeout(function() {
            var index = getIndexFromId(item.id());
            self.listData.remove(item);
            self.changeFocusAfterDelete(index, locallyTriggered);
         }, 200);
      }, 1400);

   };

   self.changeFocusAfterDelete = function (index, locallyTriggered) {
      // delete can only be triggered locally on an item which has focus,   
      // remotely triggered deletes may be on either focussed or non-focussed items,

      var changeFocus = true;

      if ( !locallyTriggered  ) {
         // check whether any other element is in focus or if we need to focus a new element
         var focussedElementExists = false;
         for (var i = 0; i < self.listData().length; i++ ) {
            if (self.listData()[i].itemState() === "isBeingDisplayed") {
               focussedElementExists = true;
            }
         }
         changeFocus = focussedElementExists ? false : true;
      }

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

   self.clearDetailsChanged = function() {
      //session.log("clearing details");
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

   self.requestDataReset = function() {
      session.call("form:reset", [], {}, { disclose_me: true }).then(
         function(res) {
            console.log("resetData return");
            self.resetData(res);
         }, session.log
      );
   };

   self.fillList = function (res) {
      // clear list
      self.listData([]);

      // result list may be empty
      if(res === null || res.length === null) {
         // needs some proper error handling
         return;
      }

      // fill grid with records
      for (var i = 0; i < res.length; i++) {
         self.listData.push(new listItem(res[i]));
      }

      // set focus to first list element
      self.displayDetails(vm.listData()[0]);

      // WAMP session specific logging ..
      session.log("Filled grid with " + res.length + " entries.");
   }

   self.onItemCreated = function (args, kwargs, details) {
      console.log("onItemCreated", arguments);
      var item = kwargs;
      self.listData.push(new listItem(item));

      // highlight this for a short while
      var index = getIndexFromId(item.id);
      self.listData()[index].itemState("hasBeenCreated");
      window.setTimeout(function() { self.listData()[index].itemState(''); }, 1000);
   }

   self.onItemUpdated = function (args, kwargs, details) {
      console.log("onItemUpdated", kwargs);
      var update = kwargs;
      var index = getIndexFromId(update.id);

      // update locally stored values that habe been updated remotely
      for (var i in update) {
         if(update.hasOwnProperty(i)) {
            self.listData()[index][i](update[i]);
         }
      }

      // update the details view if this shows the updated item
      if (self.detailsCurrent.id() === update.id) {

         self.displayDetails(self.listData()[index]);

         // temporary highlighting of the changed details
         for (var i in update) {
            if (update.hasOwnProperty(i) && i != "id" ){
               self.detailsEditable.hasBeenEdited[i](true);
               (function(it) {
                     window.setTimeout(function() {
                           self.detailsEditable.hasBeenEdited[it](false);
                     }, 1400);
               })(i);
            }
         }
      }

      // temporary highlighting of the list item
      var previousItemState = self.listData()[index].itemState();
      self.listData()[index].itemState("hasBeenEdited");
      window.setTimeout(function() { self.listData()[index].itemState(previousItemState); }, 1400);
   }

   self.onItemDeleted = function (args) {
   
      var id = args[0];
      console.log("onItemDeleted", id);   

      // get the item we need to delete
      var item = self.listData()[getIndexFromId(id)];
      var locallyTriggered = false;

      self.deleteListItem(item, locallyTriggered);
   }
   
   self.onDataReset = function (args, kwargs, details) {
      console.log("onDataReset");
      self.resetData(args);
   };

   self.resetData = function (data) {
      console.log("resetData", data);

      self.displayResetNotice(true);
      setTimeout(function() {
         self.displayResetNotice(false);
      }, 1200);

      self.fillList(data);
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
