// WebMQ Server URI
var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var session = null;
var test = null;
var editor = ace.edit("editor");
var logline = 0;

//editor.setTheme("ace/theme/monokai");
editor.setTheme("ace/theme/tomorrow_night");
editor.getSession().setMode("ace/mode/javascript");
editor.getSession().setTabSize(3);
document.getElementById('editor').style.fontSize='16px';

// see ace/lib/ace/edit_session/folding.js
//editor.getSession().foldAll(1, 28);
//editor.getSession().unfold(2, false);
//editor.getSession().unfold(2, true);

// FIXME. This is a workaround: editor is not immediately ready for folding.
// Is there an event on editor we can hook up to?
window.setTimeout(function() {
   editor.getSession().foldAll(1, 28);
   }, 200);

var ellog = document.getElementById("log");
var elrunmain = document.getElementById("runmain");
var elruntest = document.getElementById("runtest");
var elclearlog = document.getElementById("clearlog");

function log() {
   ab.log(arguments);
   var s = "";
   for (var i = 0; i < arguments.length; i += 1) {
      s += JSON.stringify(arguments[i]) + " ";
   }
   s += "\n";
   ellog.innerHTML += logline + " " + s;
   ellog.scrollTop = ellog.scrollHeight;
   logline += 1;
}

function clearlog() {
   ellog.innerHTML = "";
   logline = 0;
}

function runmain() {
   if (session) {
      session.close();
      session = null;
      clearlog();
   }
   eval(editor.getValue());
}

function runtest() {
   test();
}

elrunmain.onclick = runmain;
elruntest.onclick = runtest;
elclearlog.onclick = clearlog;

log("initialized");

runmain();
