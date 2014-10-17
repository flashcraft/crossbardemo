// KnockoutJS viewmodel
// Instantiate and bind the viewmodel
var vm = new ViewModel();
ko.applyBindings(vm);


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

   /***************************************
   *  Establish connection to WAMP Router *
   ***************************************/

   // determine URI of WAMP router
   self.wsuri = null;
   // - locally run router when loaded from file for development purposes
   if (document.location.origin == "file://") {
      self.wsuri = "ws://127.0.0.1:8080/ws";
   // - else based on the IP addess the HTML is served from
   } else {
      self.wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
               document.location.host + "/ws";
   }

   // WAMP session object
   self.session = null;

   // the WAMP connection to the Router
   //
   self.connection = new autobahn.Connection({
      url: self.wsuri,
      realm: "realm1"
   });

   // fired when connection is established and session attached
   //
   self.connection.onopen = function (sess, details) {

      console.log("Connected");

      self.session = sess;

      // $('#new-window').attr('href', window.location.pathname);
      document.getElementById('secondInstance').setAttribute('href', window.location.pathname);

      self.connectionStatus("Connected to " + self.wsuri + " in session " + self.session.id);

      // set an URI prefix
      self.session.prefix("form", "io.crossbar.crossbar.demo.product");

      // request full data set initially and fill grid
      self.session.call("form:read", [], {start: 0, limit: 25}).then(self.fillList, self.session.log);

      // subscribe to data change events
      self.session.subscribe("form:oncreate", self.onItemCreated);
      self.session.subscribe("form:onupdate", self.onItemUpdated);
      self.session.subscribe("form:ondelete", self.onItemDeleted);
      self.session.subscribe("form:onreset", self.onDataReset);

      // test subscribe to meta events
      self.session.subscribe("wamp.metaevent.session.on_leave", function() {
         console.log("session.on_leave", arguments);
      });

   };


   // fired when connection was lost (or could not be established)
   //
   self.connection.onclose = function (reason, details) {
      console.log("Connection lost: " + reason, details);
      self.connectionStatus("Connection lost!");
   }


   // now actually open the connection
   //
   self.connection.open();


   /**********************************************
   *  Define our observables and other variables *
   **********************************************/

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

   // should really be:
   self.detailsEditable2 = {
      index: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      orderNumber: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      name: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      weight: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      size: {
         displayedValue: ko.observable(),
         storedValue: null,
         dirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      inStock: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      price: {
         displayedValue: ko.observable(),
         storedValue: null,
         isDirty: ko.observable(false),
         hasBeenUpdated: ko.observable(false)
      },
      itemState: ko.observable()
   };
   self.detailsEdited = ko.observable(false);

   self.addButtonVisible = ko.observable(true);
   self.deleteButtonVisible = ko.observable(true);

   // required data missing   
   self.orderNumberMissing = ko.computed(function() {
      return self.detailsEditable.orderNumber() === "";
   }, this);
   self.nameMissing = ko.computed(function() {
      return self.detailsEditable.name() === "";
   }, this);

   self.switchWarning = ko.observable(false);
   
   // save + cancel button display
   self.saveButtonVisible = ko.computed(function () {
      return self.orderNumberMissing() === false && self.nameMissing() === false && self.detailsEditable.fieldValueChanged.counter() > 0;
   }, this);
   self.cancelButtonVisible = ko.computed(function () {
      var visible = self.detailsEditable.fieldValueChanged.counter() > 0;
      // we additionally handle the cancelling of a displayed switch warning here
      // since this no longer applies if there is no changed data
      if (!visible) {
         self.switchWarning(false);
      }
      return visible;
   }, this);
   
   self.detailsCurrent = null;
   self.detailsPrevious = null;

   self.detailsIds = ["index", "orderNumber", "name", "price", "weight", "size", "inStock"];

   self.switchingBlocked = false;

   self.focusOnOrderNumber = ko.observable(true);

   self.displayResetNotice = ko.observable(false);

   self.inputs = { "orderNumber": "string", "name": "string", "price": "num", "weight": "num", "size": "num", "inStock": "num" };

   self.ListItem = function (data) {
      return {
         orderNumber: ko.observable(data.orderNumber),
         name: ko.observable(data.name),
         price: ko.observable(data.price),
         weight: ko.observable(data.weight),
         size: ko.observable(data.size),
         inStock: ko.observable(data.inStock),
         id: ko.observable(data.id),
         itemState: ko.observable()
      };
   }

   self.connectionStatus = ko.observable("Not connected!");


   /**************************************
   *  Methods for handling WAMP events   *
   **************************************/

   // +
   // handle PubSub event for item creation
   self.onItemCreated = function (args, kwargs, details) {
      
      var itemData = kwargs;
      var item = new self.ListItem(itemData)
      self.listData.push(item);

      // highlight the newly created item
      item.itemState("hasBeenCreated");
      window.setTimeout(function() { item.itemState(''); }, 1000);
   }

   // handle PubSub event for item update
   self.onItemUpdated = function (args, kwargs, details) {

      var update = kwargs;
      var index = self.getIndexFromId(update.id);
      var item = self.listData()[index];

      // update locally stored values that habe been updated remotely
      for (var i in update) {
         if(update.hasOwnProperty(i)) {
            item[i](update[i]);
         }
      }

      // update the details view if this shows the updated item
      // - should also take into consideration whether the details have been edited - FIXME!
      if (self.detailsCurrent.id() === update.id) {

         self.displayDetails(item);

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
      var previousItemState = item.itemState();
      item.itemState("hasBeenEdited");
      window.setTimeout(function() { item.itemState(previousItemState); }, 1400);
   }

   // +
   // handle PubSub event for item deletiong
   self.onItemDeleted = function (args) {
   
      var id = args[0];
      console.log("onItemDeleted", id);   

      // get the item we need to delete
      var item = self.listData()[self.getIndexFromId(id)];
      var locallyTriggered = false;

      self.deleteListItem(item, locallyTriggered);
   }
   
   // +
   // handle PubSub event for data reset
   self.onDataReset = function (args, kwargs, details) {
      self.resetData(args);
   };

   /************************************
   *  Methods for handling user input  *
   ************************************/

   // +
   // delete triggered locally via delete button on list item
   self.triggerDelete = function( listItem, event ) {
      self.session.call("form:delete", [listItem.id()], {}, { disclose_me: true }).then(
         function(res) {
            // console.log("item " + listItem.id() + " deleted on backend", res);
            var locallyTriggered = true;
            self.deleteListItem(listItem, locallyTriggered);
         },
         self.session.log // we should really have some error handling here - FIXME!
         );
   };

   /*********************************
   *  Helper methods & miscellany   *
   *********************************/

   // +
   // fill items list after initial connect or reconnect
   self.fillList = function (res) {
      // clear list since this is also called after reconnect
      self.listData([]);

      // result list may be empty
      if(res === null || res.length === null) {
         // needs some proper error handling
         return;
      }

      // fill grid with records
      res.forEach(function (itemData) {
         self.listData.push(new self.ListItem(itemData));
      })

      // set focus & display details for first list element
      self.displayDetails(vm.listData()[0]);
   }

   self.displayDetails = function(listItem, event) {

      self.clearDetailsChanged();
      self.switchWarning(false);

      // copy the observables to the details editable observables
      for (var i = 0; i < self.detailsIds.length; i++) {
         self.detailsEditable[self.detailsIds[i]](listItem[self.detailsIds[i]]());
      }

      // reset the field states - IMPLEMENT ME

      // store reference to list item for revert to stored values on cancel
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

   };

   self.displayDetails2 = function(listItem, event) {

      self.clearDetailsChanged2();
      self.switchWarning(false);

      // fill detailsEditable
      self.detailsIds.forEach(function(key) {
         var property = self.detailsEditable[key];

         // displayedValue         
         property.displayedValue(listItem[self.detailsIds[key]]());
         // storedValue - the actual observable for now
         property.storedValue = listItem[self.detailsIds[key]];
         // reset dirty state
         property.isDirty(false);
         // reset updated state
         property.hasBeenUpdated(false);
      })
      
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

   };

   self.clearDetailsChanged2 = function() {

      // reset all changed values to false
      for (var i in self.detailsEditable) {
         if (self.detailsEditable.hasOwnProperty(i)) {
            self.detailsEditable[i].dirty(false);
         }
      }
      // reset the counter to 0
      self.detailsEdited(false);
   };

   self.clearDetailsChanged = function() {
      //self.session.log("clearing details");
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

   // format input on fields in item details box
   self.mangleInputs = function(viewmodel, event) {
      
      // block non-numeric input on numeric input fields
      if (self.inputs[event.target.id] === "num") {
         // self.session.log("evt", event.keyCode);
         if (event.keyCode > 57 && event.keyCode !== 190) {
            return false;
         }
      }
      
      return true; // knockout.js otherwise prevents the default action
   };


   self.checkForValueChange = function(viewmodel, event) {
      // currently may be called before the initial loading of items, or on empyt lists,
      // i.e. when there are no values to compare to
      // should handle this - FIXME
      if (!self.detailsCurrent) {
         return;
      }
      console.log("checkForValueChange");

      //self.exevent = event;
      //self.session.log("checking", viewmodel, event.target.value, event.target.id);
      var valueId = event.target.id;
      var currentValue = event.target.value;
      // self.session.log("vId", valueId, "cv", currentValue);
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

         self.session.call("form:create", [], saveSet, { disclose_me: true }).then(
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
            self.session.log
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

         self.session.call("form:update", [], updateSet, { disclose_me: true }).then(
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
            self.session.log
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
      self.listData.push(new self.ListItem(newItem));
      //set itemState (hack, no idea why the regular set as part of newItem not working - FIXME
      var listLength = self.listData().length;
      self.listData()[listLength - 1].itemState("isNew");

      // display the change
      self.displayDetails(self.listData()[listLength - 1]);

   };

  
   
   self.deleteListItem = function (item, locallyTriggered) {

      item.itemState("isBeingDeleted");

      var timeout = locallyTriggered === true ? 500 : 1500;

      window.setTimeout(function() {
         // fade out item - CHECKME!
         item.itemState("nonDisplay");
         // set timeout to delete item after end of fade
         window.setTimeout(function() {
            var index = self.getIndexFromId(item.id());
            self.listData.remove(item);
            self.changeFocusAfterDelete(index, locallyTriggered);
         }, 200);
      }, timeout);

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

   
   // local user requests data reset
   // +
   self.requestDataReset = function() {
      self.session.call("form:reset", [], {}, { disclose_me: true }).then(
         function(res) {
            self.resetData(res);
         }, self.session.log
      );
   };

   self.resetData = function (data) {
      console.log("resetData", data);

      self.displayResetNotice(true);
      setTimeout(function() {
         self.displayResetNotice(false);
      }, 1200);

      self.fillList(data);
   };

   self.getIndexFromId = function (id) {
      var index;
      for (var i = 0; i < vm.listData().length; i++) {
         if (vm.listData()[i].id() === id) {
            index = vm.listData()[i].index();
         }
      }
      return index;
   }

   self.helpShown = ko.observable(false);
   self.toggleHelp = function (viewmodel, event) {
      console.log("toggleHelp", event);
      self.helpShown(!self.helpShown());
   }

}



