var autobahn = require('autobahn');
var data = require('./data.js');

var connection = new autobahn.Connection({
   url: 'ws://127.0.0.1:8080/ws',
   realm: 'realm1'}
);
var session = null;

var readItems = function (args, kwargs, details) {
   // console.log("read called", arguments);

   var offset = kwargs.start;
   var limit = kwargs.limit;

   // construct results set
   var res = data.items.slice(offset, limit);

   return res;
};

var createItem = function (args, kwargs, details) {
   // console.log("create called", arguments);

   var newItem = kwargs;
   var caller =  details.caller ? [details.caller] : [];

   // console.log("caller: ", caller);

   // create an id for this
   var id = makeid(10);
   newItem.id = id;

   // add to our data
   data.items.push(newItem);

   // notify subscribers
   session.publish('io.crossbar.crossbar.demo.product.oncreate', [], newItem, { exclude: caller });

   // return the item
   return newItem;
};

var deleteItem = function (args, kwargs, details) {
   var id = args[0];
   var caller =  details.caller ? [details.caller] : [];

   // get index & check whether the item to delete exists in the backend
   var index = null;
   data.items.some(function (el, i, arr) {
      console.log(i, el);
      if (el.id === id) {
         index = i;
         return true;
      } else {
         return false;
      }
   });
   if (index === null ) {
      throw new autobahn.Error('io.crossbar.crossbar.demo.product.error', ['tried to delete non-existent item'], { name: "tried to delete non-existent item" });
   }

   // delete item from backend
   data.items.splice(index, 1);

   // notify subscribers
   session.publish('io.crossbar.crossbar.demo.product.ondelete', [id], {}, { exclude: caller });

   // return success
   return id;
};

var updateItem = function (args, kwargs, details) {
   // console.log("updateItem called", args, kwargs, details);

   var update = kwargs;
   var id = update.id;
   var caller =  details.caller ? [details.caller] : [];

   // check & normalize data


   // update the backend data
   var index = null;
   data.items.some(function (el, i, arr) {
      console.log(i, el);
      if (el.id === id) {
         index = i;
         return true;
      } else {
         return false;
      }
   });
   if (index === null ) {
      throw new autobahn.Error('io.crossbar.crossbar.demo.product.error', ['tried to update non-existent item'], { name: "tried to update non-existent item" });
   }

   var item = data.items[index];
   for (var i in update) {
      item[i] = update[i];
   }

   // notify subscribers
   session.publish('io.crossbar.crossbar.demo.product.onupdate', [], update, { exclude: caller });

   // return success
   return update;
};

var filterItems = function (args, kwargs, details) {
   var size = args[0];
   var prefix = kwargs.name.value; // only covers searching for name prefixes - since this is all we're doing from the frontend test events at the moment

   var res = [];
   var prefixLength = prefix.length;

   // console.log("filter", size, prefix, prefixLength);

   data.items.some(function (el, i, arr) {
      console.log("some", i, el.name.slice(0, prefixLength), el.name.slice(0, prefixLength) === prefix);
      if (el.name.slice(0, prefixLength) === prefix) {
         res.push(el);
      }
      if (res.length < size) {
         return false;
      } else {
         return true;
      }
   });

   return res;

}; 

connection.onopen = function (sess) {

   session = sess;

   console.log("connected", data.items[0].id, data.items[1].id);
   // console.log("connected");

   // REGISTER procedures

   session.register('io.crossbar.crossbar.demo.product.read', readItems).then(
      function (reg) {
         console.log("procedure read registered");
      },
      function (err) {
         console.log("failed to register procedure read: " + err);
      }
   );

   session.register('io.crossbar.crossbar.demo.product.create', createItem).then(
      function (reg) {
         console.log("procedure create registered");
      },
      function (err) {
         console.log("failed to register procedure create: " + err);
      }
   );

   session.register('io.crossbar.crossbar.demo.product.delete', deleteItem).then(
      function (reg) {
         console.log("procedure delete registered");
      },
      function (err) {
         console.log("failed to register procedure delete: " + err);
      }
   );

   session.register('io.crossbar.crossbar.demo.product.update', updateItem).then(
      function (reg) {
         console.log("procedure update registered");
      },
      function (err) {
         console.log("failed to register procedure update: " + err);
      }
   );

   session.register('io.crossbar.crossbar.demo.product.filter', filterItems).then(
      function (reg) {
         console.log("procedure filter registered");
      },
      function (err) {
         console.log("failed to register procedure filter: " + err);
      }
   );


   // // PUBLISH and CALL every second .. forever
   // //
   // var counter = 0;
   // setInterval(function () {

   //    // PUBLISH an event
   //    //
   //    session.publish('com.example.oncounter', [counter]);
   //    console.log("published to 'oncounter' with counter " + counter);

   //    // CALL a remote procedure
   //    //
   //    session.call('com.example.mul2', [counter, 3]).then(
   //       function (res) {
   //          console.log("mul2() called with result: " + res);
   //       },
   //       function (err) {
   //          if (err.error !== 'wamp.error.no_such_procedure') {
   //             console.log('call of mul2() failed: ' + err);
   //          }
   //       }
   //    );

   //    counter += 1;
   // }, 1000);
};

connection.open();


/*******************
* helper functions *
*******************/

var makeid = function (len) {
   var text = "";
   var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

   for( var i=0; i < len; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   }

   return text;
};