ko.applyBindings(vm);

// using Object.create for instances of view model

var myProto = {
   test1: 123,
   test2: function (a) {
      return a + this.test1;
   },
   test3: function () {
      return this.test2(100);
   }
}

myProto.test4 = function () {
   return this.test2(1000);
}

var myObj = Object.create(myProto);