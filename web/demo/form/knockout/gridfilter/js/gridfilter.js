/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

var channelBaseUri = "http://tavendo.de/webmq/demo/chat/";

var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var sess = null;
var retryCount = 0;
var retryDelay = 2;

var rows = 20; // number of rows in the result set requested from the database
var filterFields = {}; // mapping of field names to filter input fields

var addedItemId;

function isValueChar(e) {

   //ab.log("valueChar", e);
   var kc = e.keyCode;
   if ((kc > 8 && kc < 46 && kc !== 32) || (kc > 90 && kc < 94) || (kc > 111 && kc < 186)) {
      return false;
   } else {
      return true;
   }
}

function updateStatusline(status) {
   $(".statusline").text(status);
};

gridfilter = {};


gridfilter.displayEmptyRow = function() {
   var emptyRow = { "name": " ", "orderNumber": " ", "weight": " ", "size": " ", "inStock": " ", "price": " " };
   vm.tableData.push(new product(emptyRow));
   vm.noEntries(true);
}

gridfilter.currentlyHighlighted = [];

gridfilter.isEmptyObject = function(obj) {
   // from http://stackoverflow.com/questions/4994201/is-object-empty

   // null and undefined are empty
   if (obj == null) return true;
   // Assume if it has a length property with a non-zero value
   // that that property is correct.
   if (obj.length && obj.length > 0)    return false;
   if (obj.length === 0)  return true;

   for (var key in obj) {
      if (hasOwnProperty.call(obj, key))    return false;
   }

   return true;
}


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


function onConnect0() {
   sess.authreq().then(function() {
      sess.auth().then(onAuth, ab.log);
   }, ab.log);
}


function onAuth(permissions) {
   ab.log("authenticated!", permissions);

   updateStatusline("Connected to " + wsuri);
   retryCount = 0;

   //sess.prefix("event", "http://tavendo.de/webmq/koform#");
   sess.prefix("api", "http://tavendo.de/webmq/demo/koform#");

   // send request for initial data cut from DB
   sess.call("api:filter", {}, rows).then(
      refreshGridData,
      onOraCallError);

   // subscribe to data change events
   sess.subscribe("api:oncreate", onItemCreated);
   sess.subscribe("api:onupdate", onItemUpdated);
   sess.subscribe("api:ondelete", onItemDeleted);
      
};

function onItemCreated(uri, obj){
   console.log("item created", uri, obj);

   var addedItemId = obj.id;

   // re-request the set to display for the current filter settings
   sess.call("api:filter", vm.filter(), rows).then(function(obj) {
      // console.log("received set to check", obj.length);
      
      // check whether the added item is contained in the revised set
      // that should be the current display
      console.log("results set has length " + obj.length);
      // resuls set does not always contain the item when it should
      var found = false;
      for(var i = 0; i < obj.length; i++) {
         // console.log("i", i);
       
         if(obj[i].id === addedItemId) {
            console.log("added item found in results set");
            found = true;  

            // add the item id to 'currently highlighted' array
            gridfilter.currentlyHighlighted.push(obj[i].id);

            // refresh grid with new data
            refreshGridData(obj);

            // set the current highlights
            gridfilter.setCurrentHighlights();

            // start timeout for this particular highlight
            var id = obj[i].id;
            window.setTimeout(function() {
               gridfilter.removeHighlight(id);
            }, 1400);

         }
      }
      if (found === false) {
         console.log("item not in results set");
      }
   }, ab.log);

};

// function onItemCreated(uri, obj){
//    // console.log("item created", uri, obj);

//    var addedItemId = obj.id;

//    // re-request the set to display for the current filter settings
//    sess.call("api:filter", vm.filter(), rows).then(function(obj) {
      
//    for(var i = 0; i < obj.length; i++) {

//       if(obj[i].id === addedItemId) {

//          // check whether currently no entries, and delete the 'no entries' row
//          if (vm.noEntries() === true) {
//             vm.tableData.splice(0, 1);
//             vm.noEntries(false);
//          }

//          // add item at the correct position
//          var newRow = new product(obj[i]);
//          vm.tableData.splice(i, 0, newRow);
//          console.log("added item ", i, obj[i].id, vm.tableData());
//          // vm.tableData()[i+1].itemState("hasBeenCreated"); // throws an error ca. 20% of the time
//          // var id = obj[i].id; // i from iteration lost in timeout below without saving
//          // window.setTimeout(function() {
//          //    var index = getIndexFromId(id);
//          //    vm.tableData()[index].itemState("");
//          // }, 1400);

//          // if grid length now exceeds 'rows', cut the last item in the grid
//          if(vm.tableData().length > rows) {
//             vm.tableData.splice(rows, 1);
//          }


//       }

//    }

      

//    }, ab.log);

// };

// old onItemCreated code below

//    // // old, dirty way: just refresh the grid with the current data for the 
         //    // // filter settings + highlight the newly added item  
         //    // refreshGridData(obj);
         //    // vm.tableData()[i].itemState("hasBeenCreated");
         //    // var index = i; // i from iteration lost in timeout below without saving
         //    // window.setTimeout(function() {
         //    //    vm.tableData()[index].itemState("");
         //    // }, 1400);

         //    // code below is unfinished way of handling multiple items creation
         //    // which come at shorter intervals than the highlighting timeout
         //    // with the above, the highlight states get reset on each re-draw
         //    // of the grid when a new item comes in


// --- starting here: worked most of the time - backend problem???         
         // // check whether currently no entries, and delete the 'no entries' row
         // if (vm.noEntries() === true) {
         //    vm.tableData.splice(0, 1);
         //    vm.noEntries(false);
         // }

         //    // add item at the correct position
         //    var newRow = new product(obj[i]);
         //    vm.tableData.splice(i + 1, 0, newRow);
         //    console.log("added item ", i, obj[i].id, vm.tableData());
         //    // vm.tableData()[i].itemState("hasBeenCreated"); // throws an error ca. 20% of the time
         //    // var id = obj[i].id; // i from iteration lost in timeout below without saving
         //    // window.setTimeout(function() {
         //    //    var index = getIndexFromId(id);
         //    //    vm.tableData()[index].itemState("");
         //    // }, 1400);

         //    // if grid length now exceeds 'rows', cut the last item in the grid
         //    if(vm.tableData().length > rows) {
         //       vm.tableData.splice(rows, 1);
         //    }

function onItemUpdated(uri, obj){
   
   // console.log("item updated", obj.id);   
   var index = getIndexFromId(obj.id);

   // do nothing if the updated item is not part of the currently
   // displayed grid
   if (index === "notFound") {
      console.log("modified item not in current grid");
      return;
   }
   // temporary highlighting of the grid item
   var previousItemState = vm.tableData()[index].itemState();
   vm.tableData()[index].itemState("hasBeenEdited");
   window.setTimeout(function() { vm.tableData()[index].itemState(previousItemState); }, 1400);  

   // update the changes 
   for(var i in obj) {
      if(obj.hasOwnProperty(i)){
         vm.tableData()[index][i](obj[i]);
      }
   }
   
};


/* bug: sometimes, with multiple quick deletions,
    one item remains undeleted - FIXME
*/
function onItemDeleted(uri, id){
   console.log("item deleted", id);
   var index = getIndexFromId(id);

   // do nothing if the updated item is not part of the currently
   // displayed grid
   if (index === "notFound") {
      console.log("deleted item not in current grid");
      return;
   }

   vm.tableData()[index].itemState("isBeingDeleted");   

   window.setTimeout(function() {
      var fadeTime = 200;
      // fade out item
      var index = getIndexFromId(id); // get index again, since with mass deletions, this might have changed in the meantime
      vm.tableData()[index].itemState("nonDisplay");
      // set timeout to delete item after end of fade
      window.setTimeout(function() {
         var index = getIndexFromId(id); // get index again - see above;
         vm.tableData.splice(index, 1); // delete the item

         // check whether there is an entry beyond what was previously displayed and add this
         sess.call("api:filter", vm.filter(), rows).then(function(obj){
            if(obj.length > vm.tableData().length){
               // we need to add an object
               // in the DB, at this point multiple items may have been deleted already
               // we need to find the first item in the results set that is not 
               // part of the displayed set
               for( var i = 0;  i < obj.length; i++ ) {
                  var displayed = false;
                  var curObj = obj[i];
                  // is current item displayed?
                  // can't go by position, since several items may have been deleted before timeout finishes
                  for (var t = 0; t < vm.tableData().length; t++ ) {
                     if (curObj.id === vm.tableData()[t].id()) {
                        var displayed = true;
                     }
                  }
                  if(displayed === false) {
                     // not displayed. since we only deleted one item, this is the only item
                     // we need to add at this point
                     var newRow = new product(curObj);
                     vm.tableData.push(newRow); // can just push, since this is always added at the end;
                     return;
                  }
               }               
            }
            // check whether current list is empty
            if (vm.tableData().length === 0) {
               console.log("grid now empty");
               gridfilter.displayEmptyRow();
            }
         })
      }, fadeTime);
   }, 1400);



};

// gives the current index of the item to be updated or deleted 
// within the grid
// return 'undefined' is valid, since the item may not be part of 
// the present grid content
function getIndexFromId(id) {
   var index = "notFound",
       gridLength = vm.tableData().length;
   for (var i = 0; i < gridLength; i++ ) {
      if (vm.tableData()[i].id() === id) {
         index = i;
      }
   }
   return index;
};

function onOraCallError(error) {
   ab.log("oce", error);
   $("#error_overlay").show();
};


$(document).ready(function() {
   updateStatusline("Not connected.");

   setupDemo();

   connect();
});

function ViewModel() {

   var self = this;

   this.tableData = ko.observableArray([]);
   this.noEntries = ko.observable(false);

   // request counter
   this.requestsSent = ko.observable(0);

   // filter currently contains values changed from default empty
   this.currentFilterValues = ko.observable(false);  

   // textual inputs
   this.name = ko.observable("");
   this.orderNumber = ko.observable("");
   this.weight = ko.observable("");
   this.size = ko.observable("");
   this.inStock = ko.observable("");
   this.price = ko.observable("");

   // radio inputs
   this.nameType = ko.observable("prefix");
   this.orderNumberType = ko.observable("prefix");
   this.weightType = ko.observable("lte");
   this.sizeType = ko.observable("lte");
   this.inStockType = ko.observable("lte");
   this.priceType = ko.observable("lte");

   this.inputs = { "filterByOrderNumber": "string", "filterByName": "string", "filterByPrice": "num", "filterByWeight": "num", "filterBySize": "num", "filterByInStock": "num" };
   this.mangleInputs = function(viewmodel, event) {
      //ab.log("mangle");
      // filter out non-numeric inputs on numeric input fields
      if (self.inputs[event.target.id] === "num") {
         //ab.log("evt", event.keyCode);
         if (event.keyCode > 57 && event.keyCode !== 190) {
            return false;
         }
      }
      return true; // knockout.js otherwise prevents the default action
   };

   this.filter = ko.computed(function() {
           
      var filterSet = {};
      // triggers based on single change
      // calculates entire filter set based on present input states
      if (self.name() !== "") {
         filterSet.name = { value: self.name(), type: self.nameType() };
      }
      if (self.orderNumber() !== "") {
         filterSet.orderNumber = { value: self.orderNumber(), type: self.orderNumberType() };
      }
      if (self.weight() !== "") {
         filterSet.weight = { value: parseFloat(self.weight(), 10), type: self.weightType() };
      }
      if (self.size() !== "") {
         filterSet.size = { value: parseFloat(self.size(), 10), type: self.sizeType() };
      }
      if (self.inStock() !== "") {
         filterSet.instock = { value: parseFloat(self.inStock(), 10), type: self.inStockType() };
      }
      if (self.price() !== "") {
         filterSet.price = { value: parseFloat(self.price(), 10), type: self.priceType() };
      }
      ab.log("filterSet", filterSet);
      if (!gridfilter.isEmptyObject(filterSet)) {
         self.currentFilterValues(true);
      }
      if (sess !== null) {
         self.requestsSent(self.requestsSent() + 1);
         // console.log("filter set ", filterSet);
         sess.call("api:filter", filterSet, rows).then(onDataReceived, ab.log);
      };
      return filterSet;
   }, this);

   
   
   this.resetFilter = function() {
      console.log("clear filter clicked");
      // textual inputs
      this.name("");
      this.orderNumber("");
      this.weight("");
      this.size("");
      this.inStock("");
      this.price("");

      // radio inputs
      this.nameType("prefix");
      this.orderNumberType("prefix");
      this.weightType("lte");
      this.sizeType("lte");
      this.inStockType("lte");
      this.priceType("lte");

      // hide the reset button
      this.currentFilterValues(false);
   } 

};

function product(data) {
   return {
      id: ko.observable(data["id"]),
      name: ko.observable(data["name"]),
      orderNumber: ko.observable(data["orderNumber"]),
      weight: ko.observable(data["weight"]),
      size: ko.observable(data["size"]),
      inStock: ko.observable(data["inStock"]),
      price: ko.observable(data["price"]),
      itemState: ko.observable()
   };
};

var vm = new ViewModel(); // instantiates the view model and makes its methods accessible 

function setupDemo() {

   ko.applyBindings(vm);

   $("#helpButton").click(function() {
      $(".info_bar").toggle();      
   });
};

function onDataReceived(data) {
   refreshGridData(data);
   console.log("grid data received ", data)
};

function refreshGridData(data) {
   // handle empty return set - IMPLEMENT ME
   // should also display the error overlay, but with a different, tailored message

   // clear previous data
   vm.tableData([]);
   vm.noEntries(false);

   // add new data
   if (data.length !== 0) {
      for (var i = 0; i < data.length; i++) {
         //ab.log("iterate", i);
         vm.tableData.push(new product(data[i]));
      }
   }
   else {
      // display a 'no results for the current filter criteria' indicator
      var emptyRow = { "name": " ", "orderNumber": " ", "weight": " ", "size": " ", "inStock": " ", "price": " " };
      vm.tableData.push(new product(emptyRow));
      vm.noEntries(true);
   }
}




/*
   Highlights any of the 'currentyHighlighted' items that are found in the current grid
*/
// gridfilter.setCurrentHighlights = function() {
//    console.log("setting highlights for ", gridfilter.currentlyHighlighted.toString());
//    for(var i = 0; i < gridfilter.currentlyHighlighted.length; i++ ){
//       var index = getIndexFromId(gridfilter.currentlyHighlighted[i]);
//       if (index != "notFound") {
//          vm.tableData()[index].itemState("hasBeenCreated");
//       }
//    }
// };

gridfilter.setCurrentHighlights = function() {
   // console.log("setting highlights for ", gridfilter.currentlyHighlighted.toString());
   for( var i = 0; i < vm.tableData().length; i++ ) {
      var id = vm.tableData()[i].id();
      for( var c = 0; c < gridfilter.currentlyHighlighted.length; c++ ){
         if(id === gridfilter.currentlyHighlighted[c]) {
            vm.tableData()[i].itemState("hasBeenCreated");
         }
      }
   }
};

/*
   Removes the highlighting from a specific item, if found in the grid
   + removes this from 'currentlyHighlighted'
*/
gridfilter.removeHighlight = function(id) {
   // console.log("remove highlight from ", id);
   
   var index = getIndexFromId(id);
   // console.log("index to remove at ", index);
   if(index != "notFound") {
      vm.tableData()[index].itemState("");
   }

   for(var i = 0; i < gridfilter.currentlyHighlighted.length; i++) {
      if(gridfilter.currentlyHighlighted[i] === id) {
         gridfilter.currentlyHighlighted.splice(i, 1);   
      }
   }

};

// just for testing from here on
//function filterTable(filterData) {

//   ab.log(filterData);

//   var filteredData = [];
//   var intermediateData = currentData;
   
//   for (var i in filterData) {
//      if (filterData.hasOwnProperty(i)) {
//         //ab.log("i", i);
//         // for a filter value, do this
//         var filterKey = i;
//         var filterValue = filterData[i];
//         ab.log(filterKey, filterValue);

//         var processingData = [];
//         for (var i = 0; i < intermediateData.length; i++) {
//            var current = intermediateData[i];

//            // prefix filtering
//            var currentString = current[filterKey];
//            var currentSubString = currentString.slice(0, filterValue.length);
//            if (currentSubString === filterValue) {
//               processingData.push(current);
//            }
//         }

//         ab.log(intermediateData, processingData);

//         // set intermediateData = processingData for next loop --> progressive filtering
//         intermediateData = processingData;

//      }
//   }
//   filteredData = intermediateData;

//   return filteredData;
//}

