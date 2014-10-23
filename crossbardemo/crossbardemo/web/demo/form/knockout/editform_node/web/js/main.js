var vm = new ViewModel();
// ko.applyBindings(vm);

function ViewModel() {

   var self = this;

   /**********************************************
   *  Define our observables and other variables *
   **********************************************/

   self.listData = ko.observableArray([]);

   self.addButtonVisible = ko.observable(true);

   self.detailsIds = ["orderNumber", "name", "price", "weight", "size", "inStock"];

   self.detailsEditable = {
      orderNumber: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      name: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      weight: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      size: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      inStock: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      price: {
         displayedValue: ko.observable(),
         storedValue: ko.observable(),
         hasBeenUpdated: ko.observable(false)
      },
      itemState: ko.observable()
   };


   // add computeds for handling 'isDirty' flag on detailsEditable
   self.detailsIds.forEach(function (id) {
      // console.log("adding 'isDirty' for " + id);
      self.detailsEditable[id].isDirty = ko.computed(function() {
         return self.detailsEditable[id].displayedValue() != self.detailsEditable[id].storedValue();
      })
   });

   self.detailsDirty = ko.computed(function() {
      
      // the console.log shows similar behavior to the traditional loop below, 
      // but the computed returns as 'undefined'
      // self.detailsIds.some(function (id) { 
      //    console.log("x", id, self.detailsEditable[id].isDirty());
      //    if (self.detailsEditable[id].isDirty()) {
      //       return true;
      //    }
      // });

      for (var i = 0; i < self.detailsIds.length; ++i) {
         var id = self.detailsIds[i];
         // console.log("x", id, self.detailsEditable[id].isDirty());
         if (self.detailsEditable[id].isDirty()) {
            return true;
         }
      }

      // works equivalent to the above loop
      // easier to read in this context, but less adaptable
      // return this.orderNumber.isDirty() || this.name.isDirty() || this.weight.isDirty() || this.size.isDirty() || this.inStock.isDirty() || this.price.isDirty();

   })

   self.orderNumberMissing = ko.computed(function() {
      return self.detailsEditable.orderNumber.displayedValue() === "";
   });
   self.nameMissing = ko.computed(function() {
      return self.detailsEditable.name.displayedValue() === "";
   });

   self.switchWarning = ko.observable(false);
   self.cancelSwitchWarning = ko.computed(function() {
      if (!self.detailsDirty()) {
         self.switchWarning(false);
      }
   })
   
   self.saveButtonVisible = ko.computed(function () {
      return self.orderNumberMissing() === false && self.nameMissing() === false && self.detailsDirty();
   });

   self.cancelButtonVisible = ko.computed(function () {
      return self.detailsDirty() || ( self.detailsCurrent && self.detailsCurrent.itemState() === 'isNew');
   });
   
   self.detailsCurrent = null;
   self.detailsPrevious = null;

   self.focusOnOrderNumber = ko.observable(true);

   self.displayResetNotice = ko.observable(false);

   self.inputs = { "orderNumber": "string", "name": "string", "price": "num", "weight": "num", "size": "num", "inStock": "num" };

   

   self.connectionStatus = ko.observable("Not connected!");


   /*********************************
   *  Helper methods & miscellany   *
   *********************************/
  

   self.getIndexFromId = function (id) {
      var index = -1;
      for (var i = 0; i < vm.listData().length; i++) {
         if (vm.listData()[i].id() === id) {
            index = i;
         }
      }
      return index;
   }


   self.getItemFromId = function (id) {
      var item = null;
      for (var i = 0; i < vm.listData().length; i++) {
         if (vm.listData()[i].id() === id) {
            item = vm.listData()[i];
         }
      }
      return item;
   }

   self.helpShown = ko.observable(false);
   self.toggleHelp = function (viewmodel, event) {
      console.log("toggleHelp", event);
      self.helpShown(!self.helpShown());
   }

}