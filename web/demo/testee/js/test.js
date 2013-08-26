cases = ['3.1.1#1', '3.1.1#2', '3.1.1#3', '3.1.1#4'];

function runcase(i) {
   session.call("http://api.testsuite.wamp.ws/case/" + cases[i], 0.1).then(
      function (res) {
         console.log(cases[i], res);
      }, ab.log);
}

for (var i = 0; i < cases.length; ++i) {
   runcase(i);
}
