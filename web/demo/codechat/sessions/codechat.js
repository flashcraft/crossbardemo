/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

/*
   Checks for channel information encoded in the URL to automatically switch to that channel
*/

"use strict";

// var connect = {
//   wsuri: get_appliance_url("hub-websocket", "ws://localhost/ws"),
//   sess: null,
//   retryCount: 0,
//   retryDelay: 2,

// }

var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var sess = null;
var retryCount = 0;
var retryDelay = 2;

var subscribedChannel = null;
var urlData;

/*
   Switches the channel on which messages are transmitted
   and for which messages are received
*/
function switchChannel(newChannelId) {

   var oldChannelId = subscribedChannel;

   console.log("switchChannel called", oldChannelId, newChannelId);

   if(oldChannelId && oldChannelId === newChannelId) {
      // erroneously called, so return
      console.log("channels identical - maybe catch this before calling here?");
      return;
   }

   // either oldChannelID or newChannelID could be null = start page with no demo selected
   if (oldChannelId != null) {     
      sess.unsubscribe("event:" + oldChannelId);
      console.log("unsubscribing from channel " + oldChannelId);
   }   

   sess.prefix("event", channelBaseUri);
   console.log("subscribing to channel " + newChannelId);

   sess.subscribe("event:" + newChannelId, onMessage);

   // clear messages box
   messagesBox.innerHTML = ""; 

   subscribedChannel = newChannelId;   
}

/* 
   Sets the NewWindowLink and Url to reflect the current nick + channel
*/
function setNewWindowLinkAndUrl() {
   // set the newWindowLink & change URL
   var nickPart = "";
   if(nick != undefined) {
      nickPart = '&nick=' + nick;
   }
   // needs encoding of nick + channel for URL - IMPLEMENT ME / FIXME
   newWindowLink.setAttribute('href', window.location.pathname + '#channel=' + subscribedChannel + nickPart);
   window.location.hash = '#channel=' + subscribedChannel + nickPart;
}

/*
   Updates the status line regarding connection status,
   currently set nick & channel
*/
function updateStatusline() {
   // update the status lamp based on whether connected or not
   if(connected) {
      $("#connected").addClass("connected");
   }
   else {
      $("#connected").removeClass("connected");  
   }
   // update the statusText
   statusline.statusText.innerText = statusText;
   // update the nick & channel 
   statusline.nick.innerText = nick;
   statusline.channel.innerText = subscribedChannel;
};

   
function connect() {

   ab._Deferred = jQuery.Deferred;

   ab.connect(wsuri,

      function (session) {
         sess = session;
         ab.log("connected!");
         onConnect0();
      },

      function (code, reason, detail) {

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

               subscribedChannel = null;

               retryCount = retryCount + 1;
               
               connected = false;
               statusText = "Connection lost. Reconnecting (" + retryCount + ") in " + retryDelay + " seconds ..";
               updateStatusline();

               break;
         }
      },

      {'maxRetries': 60, 'retryDelay': 2000}
   );
}


function onConnect0() {
   console.log("onConnect0");
   sess.authreq().then(function () {
      // console.log("authreqresult");
      sess.auth().then(onAuth, ab.log);
   }, function() { console.log("autrequest failure") });
}


function onAuth(permissions) {
   ab.log("authenticated!", permissions);

   connected = true;
   statusText = "Connected to " + wsuri;
   retryCount = 0;

   // switch channel & update the URL if at least channel has been set already
   if(urlData.nick && urlData.channel) { // in favor of this: same start with as when the user picks both     
      switchChannel(urlData.channel);
   }
   updateStatusline();
   setNewWindowLinkAndUrl();

};



$(document).ready(function()
{
   connected = false;
   statusText = "Not connected.";
   updateStatusline();

   // check if channel or nick in URL
   urlData = getDataFromUrl();
   nick = urlData.nick; // may remain undefined
   
   // get nick and channel on initial load if not both gotten from URL
   if(!urlData.nick || !urlData.channel) {
      getChannelAndNick.start();
   }

   setupDemo();

   connect();
});

/*
   Necessary setup for the demo
   Is called before the connect is started
*/
function setupDemo() {
   newWindowLink = document.getElementById('new-window');
   
   document.getElementById("sendFullEditorContent").addEventListener("click", sendFullEditorContent);
   document.getElementById("sendSelectedEditorContent").addEventListener("click", sendSelectedEditorContent);

   // document.getElementById("setJavascript").addEventListener("click", switchLanguage);
   // document.getElementById("setSql").addEventListener("click", switchLanguage);
   $("#setJavascript").addClass("selected");

   getChannelAndNick.setup();

   document.getElementById("statusLine").addEventListener("click", getChannelAndNick.start);

   splitter();

   setupEditor(); // needs to be called before calls to tabs, since these instantiate editSessions on editor

   tabs.attachHandler();
   tabs.addTab(configuration.defaultLanguage);

   

   // // add the trigger for selection changes
   // var editSession = editor.getSession();
   // editSession.selection.on("changeSelection", onSelectionChanged);

   

};

/*
   Extracts setup data encoded in the hash part of the URL
   format: key=value, separator: &
   returns a dict with these
*/
function getDataFromUrl() {
   var setupInfoDictionary = {};
   // check for additional demo setup data in the URL
   //var windowUrl = window.location.href; // writable reference
   var windowUrl = document.URL; // string

   // check if '#' fragment is present
   // then make dictionary of values here
   if (windowUrl.indexOf('#') !== -1) {
      var setupInfoRaw = windowUrl.split('#')[1];
      var setupInfoSeparated = setupInfoRaw.split('&');
      
      for (var i = 0; i < setupInfoSeparated.length; i++) {
         var pair = setupInfoSeparated[i].split('=');
         var key = pair[0];
         var value = pair[1];
         setupInfoDictionary[key] = value;
      }
      
   }
   return setupInfoDictionary;
};




/*
   The routines for the overlay that requests a channel and/or nick 
   from the user
*/
var getChannelAndNick = {
   overlay: document.getElementById("initialInputOverlay"),
   channel: {},
   nick: {},
   setButton: document.getElementById("setChannelAndNick"),
   cancelButton: document.getElementById("cancelChannelAndNick"),
   requiredInput: {channel: false, nick: false}
};

// any way to do this in more elegant + shorter notation ? - CHECKME
getChannelAndNick.channel.input = document.getElementById("initialInputChannel");
getChannelAndNick.channel.reminder = document.getElementById("initialInputChannelReminder");
getChannelAndNick.channel.minLength = 5;

getChannelAndNick.nick.input = document.getElementById("initialInputNick");
getChannelAndNick.nick.reminder = document.getElementById("initialInputNickReminder");
getChannelAndNick.nick.minLength = 4;

getChannelAndNick.randomChannelId = function () {
   var _idchars = "0123456789";
   var _idlen = 6;
   var id = "";

   for (var i = 0; i < _idlen; i += 1) {
      id += _idchars.charAt(Math.floor(Math.random() * _idchars.length));
   }
   
   return id;
};

getChannelAndNick.setup = function() {
   var self = this;

   // add the event listeners to the inputs
   this.channel.input.addEventListener("keyup", function() {
      getChannelAndNick.keyup("channel");
   });
   this.nick.input.addEventListener("keyup", function() {
      getChannelAndNick.keyup("nick");
   });
   this.setButton.addEventListener("click", this.set);
   this.cancelButton.addEventListener("click", this.cancel);
}

getChannelAndNick.start = function() {
   // console.log("This ", this);
   var self = getChannelAndNick;

   // set nick and channel if already previously defined (e.g. via URL)
   if(nick != undefined) {
      self.nick.input.value = nick;
      self.keyup("nick");
   }
   if(subscribedChannel != null) {
      self.channel.input.value = subscribedChannel;
      self.keyup("channel");
   } else if (urlData.channel) {
      self.channel.input.value = urlData.channel;
      self.keyup("channel");
   }

   // hide the set key for now 
   $(self.setButton).addClass("nonVisible");
   // cancel button should be displayed if called with both values already set
   if(nick != undefined && subscribedChannel != null){
      $(self.cancelButton).removeClass("nonVisible");
   }

   // set an initial random channel
   // would need to communicate to the user that this is a random channel,
   // or offer a button to create one - not for now
   // self.channel.input.value = self.randomChannelId();
   // $(self.channel.reminder).addClass("nonVisible");
   // self.requiredInput.channel = true;

   // display the overlay
   $("#initialInputOverlay").removeClass("nonDisplay");
};
getChannelAndNick.keyup = function(type) {
   // console.log("input on " + type);
   var self = this;
   // check whether input contains the required number of characters
   if(self[type].input.value.length >= self[type].minLength) {
      $(self[type].reminder).addClass("nonVisible");
      self.requiredInput[type] = true;
   } else {
      $(self[type].reminder).removeClass("nonVisible");
      self.requiredInput[type] = false;
   }

   // check whether this also applies to the other input
   // and whether changes have been made to current settings
   var requiredPresent = true,
       changed = true;
   for(var i in self.requiredInput) {
      // console.log("i", i);
      if(self.requiredInput.hasOwnProperty(i) && self.requiredInput[i] === false) {
         requiredPresent = false;
      }
   }
   if(self.nick.input.value === nick && self.channel.input.value === subscribedChannel) {
      changed = false;
   }
   // display set button?
   if (requiredPresent === true && changed === true) {
      $(self.setButton).removeClass("nonVisible");
   } else {
      $(self.setButton).addClass("nonVisible");
   }
}
getChannelAndNick.set = function() {
   // console.log("set");
   var self = getChannelAndNick;
   console.log("self", self);
   // set the nick value
   nick = self.nick.input.value;
   // trigger the channel switch if channel changed
   if(self.channel.input.value != subscribedChannel) {
       switchChannel(self.channel.input.value);
   }  
   updateStatusline();
   setNewWindowLinkAndUrl();

   // hide the overlay
   $(self.overlay).addClass("nonDisplay");
}

getChannelAndNick.cancel = function() {
   // console.log("cancel");
   var self = getChannelAndNick;
   // hide the overlay
   $(self.overlay).addClass("nonDisplay");
   // reset the field values
   self.channel.input.value = "";
   self.nick.input.value = "";
}


/* 
  Settings for Ace editor 
*/

var configuration = {
   defaultLanguage: "javascript"
}


var editor;
function setupEditor() {
   console.log("setup editor called");
   editor = ace.edit("editor");

   editor.setTheme("ace/theme/monokai");
   // editor.setTheme("ace/theme/tomorrow_night");
   editor.getSession().setMode("ace/mode/javascript");
   editor.getSession().setTabSize(3);
   document.getElementById('editor').style.fontSize='16px';

   // see ace/lib/ace/edit_session/folding.js
   //editor.getSession().foldAll(1, 28);
   //editor.getSession().unfold(2, false);
   //editor.getSession().unfold(2, true);

   // FIXME. This is a workaround: editor is not immediately ready for folding.
   // Is there an event on editor we can hook up to?
   // window.setTimeout(function() {
   //    editor.getSession().foldAll(1, 28);
   //    }, 200);
};





/*
  Handles display of the sendSelectedEditorContent button
  P: the 'changeSelection' event does not provide any data regarding its source,
  or the present content of the selection.
  For now, with just a single editor instance, this is unproblematic, 
  but will need to be handled once we have multiple tabs
*/
function onSelectionChanged(id) {
   console.log("selection changed", id);
   // var selection = tabs.editors[id].getSession().selection,
   // sendSelectionButton = document.getElementById("sendSelectedEditorContent");

   // // check whether empty selection
   // if ( selection.isEmpty()) {
   //    if(sendSelectionButton.style.display != "none") {
   //       sendSelectionButton.style.display = "none";
   //    }
   // }
   // else {
   //    if(sendSelectionButton.style.display === "none") {
   //       sendSelectionButton.style.display = "block";
   //    }
   // }
   // // console.log("selection", selection)

};


/*
  Adjust the split between the chat & editor window halves
*/
// any way to turn this into a self-executing anonymous function?? - TRYME
function splitter() {
   var body = document.getElementsByTagName("body")[0],
       separator = document.getElementById("separator"),
       // dragger = document.getElementById("dragger"),
       ghostSeparator = document.getElementById("ghostSeparator"),
       ghostSeparatorInitialOffset = -4, // get this from CSS instead - FIXME
       upperHalf = document.getElementById("upper"),
       lowerHalf = document.getElementById("lower"),
       ix,
       iy,
       dy = 0,
       mouseDown = false;

   separator.addEventListener("mousedown", function(evt) {     
      // increment mousedown - http://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
      // ++mouseDown;
      mouseDown = true;

      // store initial mouse position
      ix = evt.x;
      iy = evt.y;

      // start display of ghostSeparator
      ghostSeparator.style.display = "block";
      
   });

   document.addEventListener("mousemove", function(evt) {
      if(mouseDown === false) {
         return;
      }

      // dx = ix - evt.x;
      dy = iy - evt.y;

      // move the ghostSeparator to stay positioned relative to the mouse pointer
      ghostSeparator.style.bottom = ghostSeparatorInitialOffset + dy + "px";

      // disable text/element selection within the entire document to prevent 
      // selection + highlighting during dragging
      $(body).addClass("unselectable");

   });

   document.addEventListener("mouseup", function(evt) {
      var upperHeight,
          lowerHeight,
          upperHeightPerc,
          lowerHeightPerc;

      // decrement mousedown
      // --mouseDown;
      if ( mouseDown === false ) {
         // mousedown could have occured outside of the separator - no action necessary then
         return;
      }
      mouseDown = false;

      // end display of ghostSeparator
      ghostSeparator.style.display = "none";

      // if position changes resulted from any intermediate mouse movement, then apply these
      
      // get current viewport height
      var vh = viewport.height(); // gives int, no "px"
      // get current heights for the halves;
      upperHeight = parseInt(window.getComputedStyle(upperHalf).height);
      lowerHeight = parseInt(window.getComputedStyle(lowerHalf).height);


      // calculate adjustments
      upperHeight = upperHeight - dy;
      lowerHeight = lowerHeight + dy;
      upperHeightPerc = upperHeight / vh * 100;
      lowerHeightPerc = lowerHeight / vh * 100;

      // apply adjustments
      upperHalf.style.height = upperHeightPerc + "%";
      lowerHalf.style.height = lowerHeightPerc + "%";

      // reset the position of the ghostSeparator
      ghostSeparator.style.bottom = ghostSeparatorInitialOffset + "px";

      // trigger resize of the Aced editor div
      // editor.resize(); // -FIXME - this now needs to apply to the currently displayed editor

      // make elements selectable again
      $(body).removeClass("unselectable"); 

   })
}

var viewport = (function() {
   // to get viewport dimensions
   // http://airve.github.io/js/verge/verge.jsA
   var win = window,
       docElem = document.documentElement,
       Modernizr = win['Modernizr'],
       matchMedia = win['matchMedia'] || win['msMatchMedia'],
       mq = matchMedia ? function(q) {
            return !!matchMedia.call(win, q).matches;
        } : function() {
            return false;
        },
       makeViewportGetter = function(dim, inner, client) {
            // @link  responsejs.com/labs/dimensions/
            // @link  quirksmode.org/mobile/viewports2.html
            // @link  github.com/ryanve/response.js/issues/17
            return (docElem[client] < win[inner] && mq('(min-' + dim + ':' + win[inner] + 'px)')
                ? function() { return win[inner]; }
                : function() { return docElem[client]; }
            );
        },
       viewportW = makeViewportGetter('width', 'innerWidth', 'clientWidth'),
       viewportH = makeViewportGetter('height', 'innerHeight', 'clientHeight')

   return {
      height: viewportH,
      width: viewportW
   }

})();  

/* 
   Initialize the status line elements for access
*/
var statusline = {
   nick: document.getElementById("nick"),
   channel: document.getElementById("channel"),
   newWindow: document.getElementById("new_window"),
   statusText: document.getElementById("statusText"),
   connected: document.getElementById("connected")
} 


/*
  Tabs Code
*/

var tabs = {};
    tabs.idCounter = 0,
    tabs.tabtops = document.getElementById("tabtops"),
    tabs.tabscontainer = document.getElementById("tabscontainer"),
    tabs.languages = {},
    tabs.editors = {},
    // tabs.editSessions = {},
    tabs.tabs = {},
    tabs.tabSequence = [],
    tabs.focusedTab = false;

tabs.attachHandler = function() {
   tabs.tabtops.addEventListener("click", tabs.tabTopClicked);
   tabs.tabtops.addEventListener("contextmenu", function(evt) {
      evt.preventDefault();
      console.log("rightclick on tabtops ", arguments);
      return false;
   });
}

tabs.tabTopClicked = function(evt) {
   // special case: addTab tab
   if(evt.target.id === "addTab") {
      // get the language for the new tab from the user
      // just a stand-in for now - FIXME / IMPLEMENT ME
      var language = prompt("Language ( javascript / sql ) ", tabs.tabs[tabs.focusedTab].language);
      if(language) {
         tabs.addTab(language);
      }      
      return;
   }
   // other tabs

   // delete button of a tab pressed
   if($(evt.target).hasClass("deleteButton")) {
      var tabtop = evt.target.parentElement;
      for(var id in tabs.tabs) {
         if(tabs.tabs.hasOwnProperty(id) && tabtop === tabs.tabs[id].tabtop) {
            // console.log("searching", id, tabtop === tabs.tabs[id].tabtop);
            tabs.destroyTab(id);
            return;
         }
      }
   } else {
      // get the id of the tab to switch to
      var tabtop = evt.target;
      for(var id in tabs.tabs) {
         if(tabs.tabs.hasOwnProperty(id) && tabtop === tabs.tabs[id].tabtop) {
            // console.log("searching", id, tabtop === tabs.tabs[id].tabtop);
            tabs.switchTab(id);
            return;
         }
      }
   }   
}

/* 
  Adds an editor tab with highlighting set for the passed language
  Default is adding this as the rightmost tab,
  if anchor is passed, it is create to the right of this
*/
tabs.addTab = function(language, anchor) {
   // create unique id for the tab
   tabs.idCounter += 1;
   var id = tabs.idCounter; 

   // create tabtop
   var tabtop = document.createElement("li");
   // $(tabtop).addClass("selected"); // remove once switch is implemented
   // create the correct title & udpate the languages dict
   if(tabs.languages[language]) {
      tabs.languages[language].openTabs += 1;
      tabs.languages[language].openedTabs += 1;
      tabs.languages[language].lastFocused = id;
      title = language + " " + tabs.languages[language].openTabs;
   } else {
      tabs.languages[language] = { lastFocused: id, openTabs: 1, openedTabs: 1 };
   }
   var title = language + " " + tabs.languages[language].openedTabs;
   tabtop.innerHTML = title;
   // add the delete button
   var deleteButton = document.createElement("div");
   $(deleteButton).addClass("deleteButton");
   deleteButton.innerHTML = "x";
   tabtop.appendChild(deleteButton);

   // // create the tab
   // var tab = document.createElement("div");
   // // $(tab).addClass("selected"); // remove once switch is implemented
      
   // // add the editor into the tab
   // var editor = document.createElement("div");
   // $(editor).addClass("editor");
   // tab.appendChild(editor);
   // tabs.editors[id] = ace.edit(editor);
   // tabs.editors[id].setTheme("ace/theme/tomorrow_night");
   // tabs.editors[id].getSession().setMode("ace/mode/" + language);
   // tabs.editors[id].getSession().setTabSize(3);
   // tabs.editors[id].insert("this is tab " + id);
   // tabs.editors[id].resize();
   // // set up the on selection changed trigger
   // var editSession = tabs.editors[id].getSession();
   // editSession.selection.on("changeSelection", function() {onSelectionChanged(id)});

   // create the edit session
   var sessionText = "this is session " + language + tabs.languages[language].openedTabs;
   var sessionLanguage = "ace/mode/" + language; // add dictionary conversion here so that we can have internal language string which maps to Ace equivalent - FIXME - fine for now with JS + sql
   var editSession = ace.createEditSession(sessionText, sessionLanguage);
   // editor.setSession(editSession);

   // save the references to these for later access
   // tabs.tabs[id] = { "tabtop": tabtop, "tab": tab, "language": language };
   tabs.tabs[id] = { "tabtop": tabtop, "session": editSession, "language": language };
   tabs.tabSequence.push(id); // needs to handle anchor - IMPLEMENT ME;

   // add the tabtop and the tab to the page
   // just append at the end for now,
   // needs addition to handle anchor - IMPLEMENT ME
   var addTab = document.getElementById("addTab");
   console.log("addTab", addTab);
   tabs.tabtops.insertBefore(tabtop, addTab);

   // tabs.tabscontainer.appendChild(tab);

   // switch to the newly added tab
   tabs.switchTab(id);
};

/*
   Switches the focus to the tab identified by the passed id
   Removes focus from the currently focused tab
*/
tabs.switchTab = function(id) {
   console.log("switching to " + id);
   // remove focus from currently focused tab, if still exists
   if(tabs.focusedTab && tabs.tabs[tabs.focusedTab]) {
      console.log(tabs.focusedTab + "was focused, removing that");
      var curTab = tabs.tabs[tabs.focusedTab];
      $(curTab.tabtop).removeClass("selected");
      // $(curTab.tab).removeClass("selected");
   }
   // set new focus
   var newTab = tabs.tabs[id];
   $(newTab.tabtop).addClass("selected");
   // $(newTab.tab).addClass("selected");
   tabs.focusedTab = id;
   // tabs.editors[id].focus();
   editor.setSession(newTab.session);

   // check whether selection exists in current tab, and switch button state accordingly
   onSelectionChanged(id);

   // update the language dict
   var language = tabs.tabs[id].language;
   tabs.languages[language].lastFocused = id;

   // resize the editor on the newly displayed tab
};


tabs.destroyTab = function(id) {
   console.log("destroyTab " + id);
   // remove HTML elements
   var tabtop = tabs.tabs[id].tabtop;
   // var tab = tabs.tabs[id].tab;
   tabtop.parentNode.removeChild(tabtop);
   // tab.parentNode.removeChild(tab);
   // store language for later update of language dict
   var language = tabs.tabs[id].language;
   // var wasFocused = $(tab.tabs[id].tabtop).hasClass("selected");
   // try to delete the document attached to the edit session of the 
   // current tab
  
   editor.getSession().doc = null;
   delete editor.getSession().doc;

   // clean up the tabs dict
   delete tabs.tabs[id];


   // clean up the tabSequence
   var tspos;
   for(var i = 0; i < tabs.tabSequence.length; i++) {
      if(tabs.tabSequence[i] === parseInt(id)) {
         tspos = i; // store the position for the switching to new tab below
         tabs.tabSequence.splice(i, 1);
         i = tabs.tabSequence.length;
      }
   }

   // switch display to other tab (if exists)
   // check whether deleted tab was focused
   if (parseInt(id) === parseInt(tabs.focusedTab)) {
      console.log("focused tab destroyed");
      if($.isEmptyObject(tabs.tabs) === false) {
         console.log("new one to pick", tspos, tabs.tabSequence, tabs.tabs[id]);
         if(tabs.tabSequence[tspos]) {
            tabs.switchTab(tabs.tabSequence[tspos]);
         } else {
            tabs.switchTab(tabs.tabSequence[tabs.tabSequence.length - 1]);
         }
      } else {
         tabs.focusedTab = false;
      }
   }
   


   // destroy the editor + clean up the editors dict
   // tabs.editors[id].destroy();
   // delete tabs.editors[id];
   // P: the memory is not freed up. try out minimal demo 'acetest.html' which
   //    also shows this behaviour   

   // update the languages dict 
   var languageTabs = tabs.languages[language];
   languageTabs.openTabs -= 1;
   // if tab was lastFocused for its language, pick new lastFocused
   if(languageTabs.lastFocused === parseInt(id)) {
      console.log("pick new lastFocused for "+language);
      // CONTINUE HERE
   }
   console.log("ltabs ", languageTabs.openTabs);
   // if (languageTabs.openTabs > 0) {
   //    // go backwards over the tabSequence and pick the first tab that matches the language
   //    for(var i = tabs.tabSequence.length - 1; i >= 0; i--) {
   //       console.log(language +": examining ", tabs.tabSequence[i], tabs.tabs[tabs.tabSequence[i]], tabs.tabs[tabs.tabSequence[i]].language);
   //       // console.log("iterating " + i);
   //       if(tabs.tabs[tabs.tabSequence[i]].language === language) {
   //          console.log("present id: " + tabs.tabSequence[i]);
   //          console.log("current lastFocused" + tabs.tabSequence[i]);
   //       }
   //    }
   // }
};




/*
  Chat code
*/

var newWindowLink,
   channelBaseUri = "http://tavendo.de/webmq/demo/chat/", // leave for now to enable checking with regular chat demo
// change to separate /demo/codechat later - CHANGEME
   messagesBox = document.getElementById("chatMessageContainer"), 
   nick,
   oldNick,
   assignedNicks = {},
   nickColors = ["black", "orange", "green", "blue", "red"],
   editorLanguage = "javascript",
   chatCodeBlocks = {},
   chatCodeBlockIdCounter = 0,
   connected = false,
   statusText = "Not connected";





/*
   Switches the language in the editor
   Resets the editor div
   // not needed anymore ? check whether this makes sense in some other context - FIXME
*/
function switchLanguage(evt) {
   // highlight the button + cease highlighting on others
   var currentButton = evt.target;
   var languageButtons = $("#languageButtonContainer > button");
   languageButtons.each(function(index, element) { 
      // console.log("lb", index, element) 
      var $element = $(element);
      if(element.id !== currentButton.id && $element.hasClass("selected")) {
         $element.removeClass("selected");
      }
      else if(element.id === currentButton.id){
         $element.addClass("selected");
      }
   });

   // set language flag
   var setLanguage = currentButton.id;
   var languageStrings = {
      setJavascript: "javascript",
      setSql: "sql"
   }
   editorLanguage = languageStrings[setLanguage];

   // maybe ask the user whether he wants to clear the edit window - to cover
   // cases where something was entered, and the user then realized the wrong 
   // syntax highlighting is used? - CONSIDER ME
   // reset the editor content & switch editor highlighting
   editor.selectAll();
   editor.removeLines(); // Hack - there should be some 'clear document command' -FIXME

   // pick the correct editor mode
   var acemodes = {javascript: "javascript", sql: "sql"};
   var mode = acemodes[editorLanguage];
   editor.getSession().setMode("ace/mode/" + mode);
}


/*
   Sends the current content of the Ace editor div
*/
function sendFullEditorContent() {

   // console.log("send full editor content");
   var block = {};
   block.content = tabs.editors[tabs.focusedTab].getValue(); 
   block.language = tabs.tabs[tabs.focusedTab].language;

   // language string needs to be one accepted by syntaxhighlighter, since this is used directly there
   // no conflicts for 'javascript' and 'sql' but FIXME on either end by having a translation dict for values!!

   var messageBlocks = [block];

   var message = constructMessage(messageBlocks);

   console.log("sending full ", message);

   sendMessage(message);
};

/*
   Sends the content currently selected in the Ace editor div
*/
function sendSelectedEditorContent() {
   console.log("send selected editor content");
   
   var block = {};
   block.language = tabs.tabs[tabs.focusedTab].language;

   // get the content of the current selection
   var selectedText = tabs.editors[tabs.focusedTab].session.getTextRange(tabs.editors[tabs.focusedTab].getSelectionRange());
   block.content = selectedText; 

   var message = constructMessage([block]);
   sendMessage(message);
};

/*
   Constructs the message to be sent
*/
function constructMessage(messageBlocks) {
   var message = {};
   // message.nick = document.getElementById("myNick").value;
   message.nick = nick;
   // check whether a nick exists, else prompt the user to enter one

   // check if own nick has changed since last send
   if (message.nick !== oldNick) {
      changeOwnNick(message.nick);
   };

   message.message = messageBlocks;

   return message;
};

/*
   The actual sending of the constructed message
*/
function sendMessage(message) {
   sess.publish("event:" + subscribedChannel, message, true);
   addMessage(message);
};




/*
   Handles incoming message events
*/
function onMessage(topicUri, event) {
   console.log(topicUri);
   console.log(event);

   addMessage(event);
   
}


/*
   Adds a message to the message box
*/
function addMessage(event) {

   // get the parts of the message event
   var message = event.message;
   var messageNick = event.nick;
   var nickColor = getNickColor(messageNick);

   var messageTime = formattedMessageTime();

   var displayMessage = document.createElement("div");
   
   // construct the message chrome
   displayMessage.classList.add("chatMessage");
   var header = document.createElement("div");
   header.classList.add("chatHeader");
   header.innerHTML = "<span style='color: " + nickColor + ";'>" + messageNick + "</span> <span class='messageTime'>" + messageTime + "</span>";
   displayMessage.appendChild(header);
   
   // construct the message blocks
   for(var i = 0; i < message.length; i++) {

      // store the code for later pasting into the editor
      var codeBlock = message[i];
      chatCodeBlocks[++chatCodeBlockIdCounter] = codeBlock;

      var messageBlock = document.createElement("div");
      messageBlock.classList.add("chatCodeBlock");
      
      // figure out which brush to use
      var brush = message[i].language;
      
      // add the code with code higlighter framing
      messageBlock.innerHTML = "<pre class='brush: " + brush +"; toolbar: false; gutter: true; auto-links: false; highlight: []'>" + message[i].content + "</pre>";
      
      // add the copy button
      var copyButton = document.createElement("button");
      copyButton.classList.add("copyButton");
      copyButton.innerHTML = "Copy";
      var id = chatCodeBlockIdCounter;
      copyButton.addEventListener("click", function() {
            // console.log("copy button pressed", id);

            copyCodeBlockFromChat(id);
      });
      messageBlock.appendChild(copyButton);

      displayMessage.appendChild(messageBlock);
   }
   messagesBox.appendChild(displayMessage);

   // trigger re-run of syntaxHighligher
   SyntaxHighlighter.highlight()

   // scroll messages box
   messagesBox.scrollTop = messagesBox.scrollHeight;
};


function copyCodeBlockFromChat(cbid) {
   console.log("should copy block with id " + cbid, chatCodeBlocks[cbid]);
   var language = chatCodeBlocks[cbid].language,
       content = chatCodeBlocks[cbid].content;

   // check language compatibility
   var editor;
   var selectedEditor = tabs.editors[tabs.focusedTab];
   var editorLanguage = tabs.tabs[tabs.focusedTab].language;

   if(editorLanguage === language) {
      // languages match, stay within current editor
      editor = selectedEditor;
   } else if (tabs.languages[language] && tabs.languages[language].openTabs > 0) {
      // switch to the last focused tab for the language
      var lastFocused = tabs.languages[language].lastFocused
      tabs.switchTab(lastFocused);
      editor = tabs.editors[lastFocused];
   } else {
      // need to create tab for language to paste into
      tabs.addTab(language);
      var lastFocused = tabs.languages[language].lastFocused
      editor = tabs.editors[lastFocused];
   }

   
   // set cursor to the end of the present content of the editor
   editor.navigateFileEnd(); // moves to the end of the current file/document

   var currentRow = editor.getCursorPosition().row;
   var currentPos = editor.getCursorPosition();
   currentPos.column = 0;
   editor.moveCursorToPosition(currentPos);

   editor.session.getDocument().insertNewLine({ row: currentRow });
   editor.session.getDocument().insertNewLine({ row: currentRow });
   editor.navigateFileEnd(); // again, because the above does not change the cursor position

   var currentPos = editor.getCursorPosition();
   currentPos.column = 0;
   editor.moveCursorToPosition(currentPos);

   // copy the content into the editor
   editor.insert(content);
   editor.navigateFileEnd(); // and once more
}

/*
   Preserves the color assigned to the old nick 
   when the nick is changed
*/
function changeOwnNick(currentNick) {
   // get the color value for the old nick
   var nickColor = assignedNicks[oldNick];
   // delete the old nick
   delete assignedNicks[oldNick];
   // add new nick with the old color
   assignedNicks[currentNick] = nickColor;
};

/*
   Returns the nick color for a nickString
   Assigns a color if none previously assigned
*/
function getNickColor(nickString) {
   
   // check if nickstring has color assigned, and return this
   if (!(nickString in assignedNicks)) {
      
      // count the nicks
      var nickCounter = 0;
      for (var i in assignedNicks) {
         if (assignedNicks.hasOwnProperty(i)) {
            nickCounter += 1;
            
         }
      }

      // pick a color
      var nickColor;
      if (nickCounter <= nickColors.length) {
         nickColor = nickColors[nickCounter];
      }
      else {
         nickColor = nickColors[(nickCounter % nickColors.length)];
      }

      // add the nick and color
      assignedNicks[nickString] = nickColor;

   }

   return assignedNicks[nickString];

};


/*
   Returns the time at which the function is called 
   Formatted as hh:mm
*/

function formattedMessageTime() {

   var messageTimeRaw = new Date();

   var day = messageTimeRaw.getDate();
   var month = messageTimeRaw.getMonth() + 1;
   var hours = messageTimeRaw.getHours();
   var minutes = messageTimeRaw.getMinutes();
   // add initial '0' where necessary
   minutes = minutes < 10 ? "0" + minutes : minutes;
   hours = hours < 10 ? "0" + hours : hours;

   var formattedMessageTime = hours + ":" + minutes;
   return formattedMessageTime;
};





/////////////////////////////////////////////////////////
/*
  Unused for reference or future use 
*/

// getting the CSS styled height
// http://jsfiddle.net/QFfLB/
// P: this only returns calculated px, not the original style in %
function getStyleProp(elem, prop){
    if(window.getComputedStyle)
        return window.getComputedStyle(elem, null).getPropertyValue(prop);
    else if(elem.currentStyle) return elem.currentStyle[prop]; //IE
};
function getHeight(elemId) {
   var d = document.createElement("div");
   d.id = elemId;
   document.body.appendChild(d);
   var h = getStyleProp(d, "height");
   document.body.removeChild(d);

   return h;
};