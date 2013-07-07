/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

/*
   Checks for channel information encoded in the URL to automatically switch to that channel
*/

"use strict"; // may cause problems when concatenating this with other, non-strict code
// solved by wrapping entire demo code in a function & declaring only within this - FIXME

// var globalTabSessions = {};

// var gCode;

// (function () { // see at end: self-executing anonymous function
/// connect object
var connect = {
   wsuri: get_appliance_url("hub-websocket", "ws://localhost/ws"),
   sess: null,
   retryCount: 0,
   retryDelay: 2,
   subscribedChannel: null,
   urlData: null,
   channelBaseUri: "http://tavendo.de/webmq/demo/codechat",
   connected: false
};

connect.startConnect = function() {
   console.log("startConnect called");
   ab._Deferred = jQuery.Deferred;

   ab.connect(connect.wsuri,

      function (session) {
         connect.sess = session;
         ab.log("connected!");
         connect.onConnect();
      },

      function (code, reason, detail) {

         connect.sess = null;
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

               connect.subscribedChannel = null;

               connect.retryCount = connect.retryCount + 1;

               connect.connected = false;
               housekeeping.statusline.statusText = "Connection lost. Reconnecting (" + connect.retryCount + ") in " + connect.retryDelay + " seconds ..";
               housekeeping.updateStatusline();

               break;
         }
      },

      {'maxRetries': 60, 'connect.retryDelay': 2000}
   );
};
connect.onConnect = function() {
   connect.sess.authreq().then(function () {
      connect.sess.auth().then(connect.onAuth, ab.log);
   }, function() { console.log("autrequest failure"); });
};
connect.onAuth = function(permissions) {
   ab.log("authenticated!", permissions);

   connect.connected = true;
   housekeeping.statusline.statusText = "Connected to " + connect.wsuri;
   connect.retryCount = 0;

   // check if channel or nick in URL
   connect.urlData = connect.getDataFromUrl();
   chat.nick = connect.urlData.nick; // may remain undefined

   // get nick and channel on initial load if not both gotten from URL
   if(!connect.urlData.nick || !connect.urlData.channel) {
      getChannelAndNick.start();
   }

   // switch channel & update the URL if at least channel has been set already
   if(connect.urlData.nick && connect.urlData.channel) {
      connect.switchChannel(connect.urlData.channel);
   }
   housekeeping.updateStatusline();
   housekeeping.setNewWindowLinkAndUrl();



   connect.sess.subscribe(connect.channelBaseUri + "#onpost", chat.onMessage); // CHECKME
};

connect.startTabConnect = function(id) {
   ab._Deferred = jQuery.Deferred;

   var tabSession = tabs.tabs[id].connection;

   ab.connect(connect.wsuri,

      function (session) {
         tabSession.session = session;
         // globalTabSessions[id] = session; // for the eval scoping
         tabs.finishAddEvalInfrastructure(id);
         ab.log("connected!");
         connect.onTabConnect(tabSession);
      },

      function (code, reason, detail) {

         tabSession.session = null;
         switch (code) {
            case ab.CONNECTION_UNSUPPORTED:
               console.log("Browser does not support WebSocket");
               break;
            case ab.CONNECTION_CLOSED:
               console.log("Connection for tab X closed");
               break;
            default:
               ab.log(code, reason, detail);

               tabSession.retryCount = tabSession.retryCount + 1;

               break;
         }
      },

      {'maxRetries': 60, 'connect.retryDelay': 2000}
   );
};
connect.onTabConnect = function(tabSession) {
   tabSession.session.authreq().then(function () {
      tabSession.session.auth().then(function(permissions) {connect.onTabAuth(permissions, tabSession)}, ab.log);
   }, function() { console.log("autrequest failure"); });
};
connect.onTabAuth = function(permissions, tabSession) {
   ab.log("authenticated 2", permissions);

   tabSession.retryCount = 0;
};
connect.switchChannel = function(newChannelId) {
   // FIXME - BACKEND: currently the subscription is for messages on ANY channel

   // var oldChannelId = subscribedChannel;

   // if(oldChannelId && oldChannelId === newChannelId) {
   //    // erroneously called, so return
   //    console.log("channels identical - maybe catch this before calling here?");
   //    return;
   // }

   // // either oldChannelID or newChannelID could be null = start page with no demo selected
   // if (oldChannelId !== null) {
   //    sess.unsubscribe("event:" + oldChannelId);
   //    console.log("unsubscribing from channel " + oldChannelId);
   // }

   // sess.prefix("event", channelBaseUri);
   // console.log("subscribing to channel " + newChannelId);

   // sess.subscribe("event:" + newChannelId, onMessage);

   // clear messages box
   chat.messagesBox.innerHTML = "";

   connect.subscribedChannel = newChannelId;

   chat.getStoredChatMessages();
};
connect.getDataFromUrl = function() {
   var setupInfoDictionary = {};
   // check for additional demo setup data in the URL
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



var housekeeping = {};
housekeeping.statusline = {
   nick: document.getElementById("nick"),
   channel: document.getElementById("channel"),
   newWindow: document.getElementById("new_window"),
   statusText: document.getElementById("statusText"),
   connected: document.getElementById("connected"),
   newWindowLink: document.getElementById('new-window')
};
housekeeping.setNewWindowLinkAndUrl = function() {
   // set the newWindowLink & change URL
   var nickPart = "";
   if(chat.nick !== undefined) {
      nickPart = '&nick=' + chat.nick;
   }
   housekeeping.newWindowLink.setAttribute('href', window.location.pathname + '#channel=' + connect.subscribedChannel + nickPart);
   window.location.hash = '#channel=' + connect.subscribedChannel + nickPart;
};
housekeeping.updateStatusline = function() {
   // update the status lamp based on whether connected or not
   if(connect.connected) {
      $(housekeeping.statusline.connected).addClass("connected");
   }
   else {
      $(housekeeping.statusline.connected).removeClass("connected");
   }
   // update the statusText
   housekeeping.statusline.statusText.textContent = statusText;
   // update the nick & channel
   housekeeping.statusline.nick.textContent = chat.nick;
   housekeeping.statusline.channel.textContent = connect.subscribedChannel;
};

// already in use, no need to adjust anything during code cleanup!
housekeeping.changeFontSize = function(evt) {
   var fontSizeChange = evt.target.id === "increase" ? +configuration.fontStepSize : -configuration.fontStepSize;
   configuration.currentFontSize += fontSizeChange;
   // catch nonsensically small fontSize values
   configuration.currentFontSize = configuration.currentFontSize < 12 ? 12 : configuration.currentFontSize;
   tabs.setFontSize(configuration.currentFontSize);
   chat.setFontSize(configuration.currentFontSize);
};

housekeeping.initialize = function() {

   
   housekeeping.statusline.statusText = "Not connected.";
   housekeeping.updateStatusline();

   housekeeping.newWindowLink = document.getElementById('new-window');

   getChannelAndNick.setup();

   $("#statusLine > .floatLeft").on("click", getChannelAndNick.start);
   $("#fontResizeButtons").on("click", housekeeping.changeFontSize);
   
   housekeeping.changeSplit();

   tabs.initialize();
   chat.initialize();
console.log("housekeeping.initialize called");
   connect.startConnect();
};
/*
  Adjust the split between the chat & editor window halves
*/
housekeeping.changeSplit = function() {
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
      ix = evt.pageX;
      iy = evt.pageY;

      // start display of ghostSeparator
      ghostSeparator.style.display = "block";

   });

   document.addEventListener("mousemove", function(evt) {
      if(mouseDown === false) {
         return;
      }

      dy = iy - evt.pageY;

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
      var vh = housekeeping.viewport.height(); // gives int, no "px"
      // get current heights for the halves;
      upperHeight = parseInt(window.getComputedStyle(upperHalf).height, 10);
      lowerHeight = parseInt(window.getComputedStyle(lowerHalf).height, 10);

      // calculate adjustments
      upperHeight = upperHeight - dy;
      lowerHeight = lowerHeight + dy;
      // enforce hard lower limit on lower height
      var minLowerHeight = 200;
      if(lowerHeight < minLowerHeight) {
         lowerHeight = minLowerHeight;
         upperHeight = vh - minLowerHeight;
      }
      // enfore lower limit on upper height
      var minUpperHeight = 20;
      if(upperHeight < minUpperHeight) {
         upperHeight = minUpperHeight;
         lowerHeight = vh - minUpperHeight;
      }
      upperHeightPerc = upperHeight / vh * 100;
      lowerHeightPerc = lowerHeight / vh * 100;

      // apply adjustments
      upperHalf.style.height = upperHeightPerc + "%";
      lowerHalf.style.height = lowerHeightPerc + "%";

      // reset the position of the ghostSeparator
      ghostSeparator.style.bottom = ghostSeparatorInitialOffset + "px";

      // trigger resize of the Aced editor div
      var editor = tabs.editors[tabs.focusedTab];
      editor.resize();


      // make elements selectable again
      $(body).removeClass("unselectable");

   });
};

housekeeping.viewport = (function() {
   // to get viewport dimensions, taken from
   // https://github.com/ryanve/verge - MIT license - http://opensource.org/licenses/MIT
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
            return (docElem[client] < win[inner] && mq('(min-' + dim + ':' + win[inner] + 'px)') ? function() { return win[inner]; } : function() { return docElem[client]; }
            );
        },
       viewportW = makeViewportGetter('width', 'innerWidth', 'clientWidth'),
       viewportH = makeViewportGetter('height', 'innerHeight', 'clientHeight');

   return {
      height: viewportH,
      width: viewportW
   };
})();


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
   requiredInput: {channel: false, nick: false},
   previouslyShown: false
};

// any way to do this in more elegant + shorter notation ? - CHECKME
getChannelAndNick.channel.input = document.getElementById("initialInputChannel");
getChannelAndNick.channel.reminder = document.getElementById("initialInputChannelReminder");
getChannelAndNick.channel.changed = false;
getChannelAndNick.channel.minLength = 3;
getChannelAndNick.channel.maxLength = 10;
getChannelAndNick.channel.regEx = /^[A-Za-z0-9_-]+$/;

getChannelAndNick.nick.input = document.getElementById("initialInputNick");
getChannelAndNick.nick.reminder = document.getElementById("initialInputNickReminder");
getChannelAndNick.nick.changed = false;
getChannelAndNick.nick.minLength = 3;
getChannelAndNick.nick.maxLength = 10;
getChannelAndNick.nick.regEx = /^[A-Za-z0-9_-]+$/;

getChannelAndNick.setup = function() {
   var self = this;

   // add the event listeners to the inputs
   this.channel.input.addEventListener("keydown", function(evt) {
      getChannelAndNick.keydown(evt, "channel");
   });
   this.nick.input.addEventListener("keydown", function(evt) {
      getChannelAndNick.keydown(evt, "nick");
   });
   this.channel.input.addEventListener("keyup", function() {
      getChannelAndNick.keyup("channel");
   });
   this.nick.input.addEventListener("keyup", function() {
      getChannelAndNick.keyup("nick");
   });
   this.channel.input.onchange = function() {
      getChannelAndNick.keyup("channel");
   };
   this.setButton.addEventListener("click", this.set);
   this.cancelButton.addEventListener("click", this.cancel);
};

var tchannels; 
getChannelAndNick.setupChannelSelector = function(res) {
   console.log("channel selector setup", res);
   var channels = [];
   for(var i = 0; i < res.length; i++) {
      channels[i] = res[i].channel;
   }
   console.log("channels", channels);
   tchannels = channels;

   $("#initialInputChannel").combobox(channels);
}

getChannelAndNick.start = function() {
   console.log("gcan start");
   var self = getChannelAndNick;

   // start setup of the getNickAndChannel combobox
   // if not previously shown
   // cannot be called before the overlay is shown, since jquery doesn't operate on
   // element with present display: none;
   // calling again on each display does not make sense with the combobox, since
   // this does not lead to an update of the selectable channels, but only adds
   // more surrounding HTML
   // CHANGEME / FIXME: combobox needs to allow updates of its content
   if(getChannelAndNick.previouslyShown === false) {
      connect.sess.call(connect.channelBaseUri + "#channels").then(getChannelAndNick.setupChannelSelector, ab.log);
      getChannelAndNick.previouslyShown = true;
   }   

   // set nick and channel if already previously defined (e.g. via URL)
   if(chat.nick !== undefined) {
      self.nick.input.value = chat.nick;
      self.keyup("nick");
   }
   if(connect.subscribedChannel !== null) {
      self.channel.input.value = connect.subscribedChannel;
      self.keyup("channel");
   } else if (connect.urlData.channel) {
      self.channel.input.value = connect.urlData.channel;
      self.keyup("channel");
   }

   // hide the set key for now
   $(self.setButton).addClass("nonVisible");
   // cancel button should be displayed if called with both values already set
   if(chat.nick !== undefined && connect.subscribedChannel !== null){
      $(self.cancelButton).removeClass("nonVisible");
   }

   // display the overlay
   $("#initialInputOverlay").removeClass("nonDisplay");
};

getChannelAndNick.keydown = function(evt, type) {
   // block any entry after maxLength for input has been reached
   var kc = evt.keyCode;
   if ((kc > 7 && kc < 46 && kc !== 32) || (kc > 90 && kc < 94) || (kc > 111 && kc < 186) ) {
      // filter non-character keypresses
      return true;
   } else if (getChannelAndNick[type].input.value.length === getChannelAndNick[type].maxLength) {
      evt.preventDefault();
      return;
   }
};
getChannelAndNick.keyup = function(type) {
   var self = this;
   console.log("keyup triggered");
   // check whether the input fulfills the backend rules
   var typeObj = self[type],
       input = typeObj.input;
   if(input.value === "" || (typeObj.regEx.test(input.value) && input.value.length < typeObj.minLength)) {
      // not long enough, so 
      // display indicator for required input
      $(typeObj.reminder).removeClass("nonVisible");
      $(typeObj.reminder).removeClass("indicateError");
      self.requiredInput[type] = false;
   } 
   else if ( typeObj.regEx.test(input.value) ) {
      // correct length + characters OK, no prompting
      $(typeObj.reminder).addClass("nonVisible");
      $(typeObj.reminder).removeClass("indicateError");
      self.requiredInput[type] = true;
   } 
   else {
      // invalid characters, prompt in red
      $(typeObj.reminder).removeClass("nonVisible");
      $(typeObj.reminder).addClass("indicateError");
      self.requiredInput[type] = false;
   }


   // check whether this also applies to the other input
   // and whether changes have been made to current settings
   var requiredPresent = true,
       changed = true;
   for(var i in self.requiredInput) {
      if(self.requiredInput.hasOwnProperty(i) && self.requiredInput[i] === false) {
         requiredPresent = false;
      }
   }
   if(self.nick.input.value === chat.nick && self.channel.input.value === connect.subscribedChannel) {
      changed = false;
   }
   // display set button?
   if (requiredPresent === true && changed === true) {
      $(self.setButton).removeClass("nonVisible");
   } else {
      $(self.setButton).addClass("nonVisible");
   }
};

getChannelAndNick.set = function() {
   var self = getChannelAndNick;
   // set the nick value
   chat.nick = self.nick.input.value;
   // trigger the channel switch if channel changed
   if(self.channel.input.value != connect.subscribedChannel) {
      connect.switchChannel(self.channel.input.value);
   }
   housekeeping.updateStatusline();
   housekeeping.setNewWindowLinkAndUrl();

   // hide the overlay
   $(self.overlay).addClass("nonDisplay");
};

getChannelAndNick.cancel = function() {
   var self = getChannelAndNick;
   // hide the overlay
   $(self.overlay).addClass("nonDisplay");
   // reset the field values
   self.channel.input.value = "";
   self.nick.input.value = "";
};


/*
  Tabs Code
*/

var tabs = {};
tabs.idCounter = 0;
tabs.tabtops = document.getElementById("tabtops");
tabs.addTabTop = document.getElementById("addTab");
tabs.addTabButton = document.getElementById("addTabButton");
tabs.addTabMenuExpanded = false;
tabs.addTabLanguages = document.getElementById("addTabLanguages");
tabs.tabscontainer = document.getElementById("tabscontainer");
tabs.languages = {};
tabs.availableLanguages = ["js", "plsql", "tsql", "python", "text", "jswebmq"];
tabs.localToAce = {js: "javascript", plsql: "sql", tsql: "sql", python: "python", text: "text", jswebmq: "javascript"}; // FIXME - mappings for plsql + tsql
tabs.localToSyntaxhighlighter = {js: "javascript", plsql: "plsql", tsql: "tsql", python: "python", text: "plain", jswebmq: "javascript"};
tabs.localToDisplay = {js: "JS", plsql: "PL/SQL", tsql: "T-SQL", python: "Python", text: "Text", jswebmq: "JS/WebMQ"};
tabs.editors = {};
tabs.tabs = {};
tabs.tabSequence = [];
tabs.loneTab = null;
tabs.focusedTab = false;
// tabs.addTabMenuShown = false;
tabs.zIndex = 1000000; // initially set to number high enough that max number of tabs opened during a session does not exceed it
tabs.zIndexSelected = tabs.zIndex + 1;
tabs.lastClosedTab = {};
tabs.snippetsOverlay = document.getElementById("snippetsOverlay");
tabs.snippets = [
   // {title: "CodeChat", image: "screenshot_codechat.png", link: "codechat/index.html", language: "jswebmq", ttitle: "Snippets for CodeChat", code: "codechat.js"},
   // {title: "Notification", image: "screenshot_notifications.png", link: "notification/index.html?channel=123456", language: "jswebmq", ttitle: "Snippets for Notifications", code: "notification.js"},
   // {title: "Chat", image: "screenshot_chat.png", link: "chat/index.html", language: "jswebmq", ttitle: "Snippets for Chat", code: "chat.js"},
   // {title: "Vote", image: "screenshot_vote.png", link: "vote/index.html", language: "jswebmq", ttitle: "Snippets for Vote", code: "vote.js"},
   // {title: "Gridfilter", image: "screenshot_gridfilter.png", link: "form/knockout/gridfilter/index.html", language: "jswebmq", ttitle: "Snippets for Gridfilter", code: "gridfilter.js"}
   {title: "Notification", image: "screenshot_notifications.png", link: "notification/index.html?channel=123456", codeSnippets: [
      {display: "JS", language: "jswebmq", ttitle: "JS snippets for Notifications", code: "notification.js"}
      ]
   },
   {title: "Vote", image: "screenshot_vote.png", link: "vote/index.html", codeSnippets: [
      {display: "JS", language: "jswebmq", ttitle: "JS snippets for Vote", code: "vote.js"}, 
      {display: "PL/SQL", language: "plsql", ttitle: "PL/SQL snippets for Vote", code: "vote.sql"}]
   }
];

tabs.initialize = function() {

   document.getElementById("sendFullEditorContent").addEventListener("click", tabs.sendFullEditorContent);
   document.getElementById("sendSelectedEditorContent").addEventListener("click", tabs.sendSelectedEditorContent);
   document.getElementById("evalFullEditorContent").addEventListener("click", tabs.evalFullEditorContent);
   document.getElementById("evalSelectedEditorContent").addEventListener("click", tabs.evalSelectedEditorContent);

   tabs.tabtops.addEventListener("click", tabs.tabTopClicked);
   
   tabs.addTabButton.addEventListener("click", tabs.toggleAddTabMenu);
   document.addEventListener("click", function(evt) {
      if (tabs.addTabMenuExpanded === true && evt.target != tabs.addTabTop && evt.target != tabs.addTabButton ) {
         tabs.toggleAddTabMenu();
      }
   });

   // catch right clicks on the tabtops to enable 'close other tabs' - IMPLEMENT ME
   tabs.tabtops.addEventListener("contextmenu", function(evt) {
      evt.preventDefault();
      return false;
   });

   var addTabLanguages = document.getElementById("addTabLanguages"),
       snippetsButtonContainer = document.getElementById("snippetsButtonContainer"),
       snippetsButton = document.getElementById("snippetsButton");
   
   $.each(tabs.availableLanguages, function(index, value) {
      var listItem = document.createElement("li"),
          button = document.createElement("button"),
          language = tabs.availableLanguages[index];

      button.textContent = tabs.localToDisplay[language];
      button.addEventListener("click", function() {
         // tabs.addTab(tabs.localToAce[language]);
         tabs.addTab(language); // LMOD
         $("#addTabLanguages").addClass("nonDisplay");
      });

      listItem.appendChild(button);
      addTabLanguages.insertBefore(listItem, snippetsButtonContainer);
      // addTabLanguages.appendChild(listItem);
   });

   snippetsButton.addEventListener("click", function() {
      $(tabs.snippetsOverlay).removeClass("nonDisplay");
   });

   var snippetsCancelButton = document.getElementById("snippetsCancelButton");
   snippetsCancelButton.addEventListener("click", function() {
      $(tabs.snippetsOverlay).addClass("nonDisplay");
   })


   // add the items to the snippets overlay
   var snippetsBox = document.getElementById("snippetsBox");
   for (var i = 0; i < tabs.snippets.length; i++) {
      var snippet = tabs.snippets[i],
          item = document.createElement("div"),
          title = document.createElement("h2"),
          // image = document.createElement("img"),
          demolink = document.createElement("a"),
          cancelButton = document.getElementById("snippetsCancel");
      title.textContent = snippet.title;
      // image.src = "img/" + snippet.image;
      item.appendChild(title);


      for(var c = 0; c < snippet.codeSnippets.length; c++) {
         var codeSnippet = snippet.codeSnippets[c],
             codeLink = document.createElement("a");
         
         codeLink.textContent = codeSnippet.display;
         $(codeLink).addClass("codeLink");
         codeLink.addEventListener("click", (function(language, code, ttitle) {
            return function() {
               var ajCode;
               var url = "snippets/" + code;
               console.log("Adding code snippets", language, code, ttitle, url);

               if (true) {
                  var data = httpGet(url);
                  tabs.addTab(language, data, ttitle);
               } else {
                  // FIXME: this version does NOT work. for some reasons, it
                  // immediately evalutes (!) (wtf?) the code snippets .. which does no
                  // good since e.g. AB session is only available later
                  $.get(url, function(data) {
                     console.log("Got code snippets for " + code, data);
                     tabs.addTab(language, data, ttitle);
                  });
               }

               $(tabs.snippetsOverlay).addClass("nonDisplay");
            };
         })(codeSnippet.language, codeSnippet.code, codeSnippet.ttitle));
         item.appendChild(codeLink);
      }
      
      // image.addEventListener("click", function() {
      //    tabs.addTab(snippet.language, snippet.code, snippet.ttitle);
      //    $(tabs.snippetsOverlay).addClass("nonDisplay");
      // })
      
      demolink.textContent = "open demo";
      demolink.href = "/demo/" + snippet.link;
      demolink.target = "_blank";
      $(demolink).addClass("demoLink");
      item.appendChild(demolink);

      snippetsBox.insertBefore(item, cancelButton);
   }


   tabs.addTab(configuration.defaultLanguage);
};

tabs.toggleAddTabMenu = function() {
   var $addTabLanguages = $(tabs.addTabLanguages),
       $addTabTop = $(tabs.addTabTop);
   if(tabs.addTabMenuExpanded === false) {
      $addTabLanguages.removeClass("nonDisplay");
      $addTabTop.addClass("addTabExpanded");
      tabs.addTabMenuExpanded = true;
   } else {
      $addTabLanguages.addClass("nonDisplay");
      $addTabTop.removeClass("addTabExpanded");
      tabs.addTabMenuExpanded = false;
   }

};


tabs.tabTopClicked = function(evt) {
   // special case: addTab tab
   if(evt.target.id === "addTab") {
      // toggling of addTabsMenu handled in tabs.toggleAddTabMenu;
      return;
   }
   // other tabs

   // delete button of a tab pressed
   var id,
       tabtop;
   if($(evt.target).hasClass("deleteButton")) {
      tabtop = evt.target.parentElement;
      for(id in tabs.tabs) {
         if(tabs.tabs.hasOwnProperty(id) && tabtop === tabs.tabs[id].tabtop) {
            tabs.destroyTab(id);
            return;
         }
      }
   } else {
      // get the id of the tab to switch to
      tabtop = evt.target;
      for(id in tabs.tabs) {
         if(tabs.tabs.hasOwnProperty(id) && tabtop === tabs.tabs[id].tabtop) {
            tabs.switchTab(id);
            return;
         }
      }
   }
};

/*
  Adds an editor tab with highlighting set for the passed language
  Default is adding this as the rightmost tab,
  if anchor is passed, it is create to the right of this
*/
tabs.addTab = function(language, content, ttitle) {
   // create unique id for the tab
   tabs.idCounter += 1;
   var id = tabs.idCounter;

   // create tabtop
   var tabtop = document.createElement("li");
   // create the correct tabtop header & udpate the languages dict
   if(tabs.languages[language]) {
      tabs.languages[language].openTabs += 1;
      tabs.languages[language].openedTabs += 1;
      tabs.languages[language].lastFocused = id;
      title = language + " " + tabs.languages[language].openTabs;
   } else {
      tabs.languages[language] = { lastFocused: id, openTabs: 1, openedTabs: 1 };
   }
   var headerText = tabs.localToDisplay[language] + " " + tabs.languages[language].openedTabs;
   tabtop.innerHTML = headerText;
   // add the delete button
   var deleteButton = document.createElement("div");
   $(deleteButton).addClass("deleteButton");
   deleteButton.innerHTML = "x";
   tabtop.appendChild(deleteButton);

   // create the tab
   var tab = document.createElement("div");

   // add the title input into the tab
   var title = document.createElement("div");
   $(title).addClass("titleBar");
   var titleInput = document.createElement("input");
   titleInput.type = "text";
   titleInput.placeholder = "Title (optional)";
   titleInput.size = "80";
   titleInput.maxLength = "80";
   title.appendChild(titleInput);
   tab.appendChild(title);
   // tabs.titles[id] = titleInput;
   // tabs.tabs[id].titleInput = titleInput;

   // add the editor into the tab
   var editorWrapper = document.createElement("div");
   $(editorWrapper).addClass("editorWrapper");
   tab.appendChild(editorWrapper);
   editorWrapper.addEventListener("keyup", tabs.keyboardOperation);

   var editor = document.createElement("div");
   $(editor).addClass("editor");
   editorWrapper.appendChild(editor);
   tabs.editors[id] = ace.edit(editor);
   tabs.editors[id].setTheme("ace/theme/tomorrow_night");
   tabs.editors[id].getSession().setMode("ace/mode/" + tabs.localToAce[language]);
   tabs.editors[id].getSession().setTabSize(3);
   tabs.editors[id].setFontSize(configuration.currentFontSize);
   tabs.editors[id].resize();

   // set up the on selection changed trigger
   var editSession = tabs.editors[id].getSession();
   editSession.selection.on("changeSelection", function() {tabs.onSelectionChanged(id);});

   // add any editor content
   if(content){
      tabs.editors[id].insert(content);
   }

   // save the references to these for later access
   tabs.tabs[id] = { "tabtop": tabtop, "tab": tab, "language": language, "titleInput": titleInput };
   tabs.tabSequence.push(id); // needs to handle anchor - IMPLEMENT ME;
   // set the tab title if provided
   if(ttitle){
      tabs.tabs[id].titleInput.value = ttitle;
   }

   // additional adds if jswebmq tab
   if(language === "jswebmq") {
      tabs.startAddEvalInfrastructure(id);
   }

   // add the tabtop and the tab to the page
   // var addTab = document.getElementById("addTab");
   // tabs.tabtops.insertBefore(tabtop, addTab);
   tabs.tabtops.appendChild(tabtop);
   // adjust the z-indices for the correct overlap of the box shadow
   tabs.zIndex -= 1;
   tabtop.style.zIndex = tabs.zIndex;

   // tabs.tabtops.appendChild(tabtop);
   tabs.tabscontainer.appendChild(tab);

   // switch to the newly added tab
   tabs.switchTab(id);

   // change delete button display if necessary
   tabs.switchDeleteButton();

   // set style on addTab in order to display fully
   document.getElementById("addTab").style.padding = "";
};

tabs.startAddEvalInfrastructure = function(id) {
   console.log("addEval", id);

   // the store location for the session
   tabs.tabs[id].connection = {};
   tabs.tabs[id].eval = true;
   connect.startTabConnect(id);
};
tabs.finishAddEvalInfrastructure = function(id) {
   var evTab = tabs.tabs[id];
   evTab.connection.context = tabs.createContext({session: evTab.connection.session, ab: ab});
};
/* create iframe for an eval tab to separate code for eval */
tabs.createContext = function(context) {
   var iframe = document.createElement('iframe');

   if (!iframe.style) iframe.style = {};
   iframe.style.display = 'none';
   document.body.appendChild(iframe);

   var win = iframe.contentWindow;

   if (!win.eval && win.execScript) {
      // win.eval() magically appears when this is called in IE:
      win.execScript('null');
   }

   for (var c in context) {
      win[c] = context[c];
   }

   return win;
};
tabs.runInContext = function(win, script) {
   var res = win.eval(script);
   return res;
};

/*
   Catches specific key combinations within the editor 
   div to enable keyboard triggering of events outside of the editor
*/
tabs.keyboardOperation = function(evt) {
   // ctrl + enter to send entire content of editor
   if(evt.which === 13 && evt.ctrlKey === true) {
      // switch depending on whether there is a selection to be sent
      var selection = tabs.editors[tabs.focusedTab].getSession().selection;
      if (selection.isEmpty()) {
         tabs.sendFullEditorContent();
      } else {
         tabs.sendSelectedEditorContent();
      }
      
   }
};

/*
   Disables the delete button if only one tab present,
   re-enables this once min 2 tabs are present
*/
tabs.switchDeleteButton = function() {
   var deleteButton;
   if(tabs.tabSequence.length === 1) {
      var loneTab = tabs.tabs[tabs.tabSequence[0]];
      deleteButton = loneTab.tabtop.getElementsByClassName("deleteButton")[0];
      $(deleteButton).addClass("nonVisible");
      tabs.loneTab = loneTab;
   } else if (tabs.tabSequence.length > 1 && tabs.loneTab !== null) {
      deleteButton = tabs.loneTab.tabtop.getElementsByClassName("deleteButton")[0];
      $(deleteButton).removeClass("nonVisible");
      tabs.lastTab = null;
   }
};

/*
   Switches the focus to the tab identified by the passed id
   Removes focus from the currently focused tab
*/
tabs.switchTab = function(id) {
   // remove focus from currently focused tab, if still exists
   if(tabs.focusedTab && tabs.tabs[tabs.focusedTab]) {
      var curTab = tabs.tabs[tabs.focusedTab];
      $(curTab.tabtop).removeClass("selected");
      $(curTab.tab).removeClass("selected");
      curTab.tabtop.style.zIndex = tabs.focusedTabPreviousZIndex;
   }
   // set new focus
   var newTab = tabs.tabs[id];
   $(newTab.tabtop).addClass("selected");
   $(newTab.tab).addClass("selected");
   tabs.focusedTab = id;
   tabs.editors[id].focus();
   tabs.editors[id].resize();

   // check whether eval tab, and switch button state accordingly
   var evalFullContentButton = document.getElementById("evalFullEditorContent");
   if(tabs.tabs[id].eval === true) {
      evalFullContentButton.style.display = "block";
   } else {
      evalFullContentButton.style.display = "none";
   }

   // check whether selection exists in current tab, and switch button state accordingly
   tabs.onSelectionChanged(id);

   

   // update the language dict
   var language = tabs.tabs[id].language;
   tabs.languages[language].lastFocused = id;

   // switch z-index to display above others
   tabs.focusedTabPreviousZIndex = newTab.tabtop.style.zIndex;
   newTab.tabtop.style.zIndex = tabs.zIndexSelected;

};


tabs.destroyTab = function(id) {
   // remove HTML elements
   var tabtop = tabs.tabs[id].tabtop;
   var tab = tabs.tabs[id].tab;
   tabtop.parentNode.removeChild(tabtop);
   tab.parentNode.removeChild(tab);
   // store language for later update of language dict
   var language = tabs.tabs[id].language,
       title = tabs.tabs[id].titleInput.value;
   // clean up the tabs dict
   delete tabs.tabs[id];


   // clean up the tabSequence
   var tspos;
   for(var i = 0; i < tabs.tabSequence.length; i++) {
      if(tabs.tabSequence[i] === parseInt(id, 10)) {
         tspos = i; // store the position for the switching to new tab below
         tabs.tabSequence.splice(i, 1);
         i = tabs.tabSequence.length;
      }
   }

   // store the editor content + language for getting last closed tab back
   tabs.lastClosedTab.language = language;
   tabs.lastClosedTab.content = tabs.editors[id].getValue();
   tabs.lastClosedTab.title = title;
   // add or modify the last closed tab button
   
   if(!tabs.lastClosedTab.button) {
      var listItem = document.createElement("li"),
          button = document.createElement("button"),
          addTabLanguages = document.getElementById("addTabLanguages");
      button.textContent = "last closed";
      $(button).addClass("lastClosedButton");
      listItem.appendChild(button);
      addTabLanguages.appendChild(listItem);
      tabs.lastClosedTab.button = button;
   }
   tabs.lastClosedTab.button.onclick = tabs.restoreLastClosed;

   // destroy the editor + clean up the editors dict
   tabs.editors[id].destroy();
   delete tabs.editors[id];
   // P: the memory is not freed up. try out minimal demo 'acetest.html' which
   //    also shows this behaviour - FIXME

   // update the languages dict
   var languageTabs = tabs.languages[language];
   languageTabs.openTabs -= 1;
   if(languageTabs.lastFocused === parseInt(id, 10) || languageTabs.lastFocused === id) {
      languageTabs.lastFocused = null;
   }

   // switch display to other tab if deleted tab had focus
   if (parseInt(id, 10) === parseInt(tabs.focusedTab, 10)) {
      if($.isEmptyObject(tabs.tabs) === false) {
         if(tabs.tabSequence[tspos]) {
            tabs.switchTab(tabs.tabSequence[tspos]);
         } else {
            tabs.switchTab(tabs.tabSequence[tabs.tabSequence.length - 1]);
         }
      } else {
         console.log("this should not be called!!!"); // last tab should not have delete button
         tabs.focusedTab = false;
      }
   }

   tabs.switchDeleteButton();

   // if switch didn't focus on a tab with same language as deleted,
   // may need to set a new last focused
   if(languageTabs.lastFocused === null ) {
      if (languageTabs.openTabs > 0) {
         // go backwards over the tabSequence and pick the first tab that matches the language
         for(var i = tabs.tabSequence.length - 1; i >= 0; i--) {
            if(tabs.tabs[tabs.tabSequence[i]].language === language) {
               languageTabs.lastFocused = tabs.tabSequence[i];
               i = 0;
            }
         }
      } else {
         // handling needed here? - CHECKME
      }
   }
};

tabs.restoreLastClosed = function() {
   var language = tabs.lastClosedTab.language,
       content = tabs.lastClosedTab.content,
       title = tabs.lastClosedTab.title;
   tabs.addTab(language, content, title);
   $("#addTabLanguages").addClass("nonDisplay");
};

/* loops over existing editors and sets the new font size */
tabs.setFontSize = function(fontSize) {
   for(var i in tabs.editors) {
      if(tabs.editors.hasOwnProperty(i)) {
         tabs.editors[i].setFontSize(fontSize);
      }
   }
};

/*
  Handles display of the sendSelectedEditorContent button
  P: the 'changeSelection' event does not provide any data regarding its source,
  or the present content of the selection.
  For now, with just a single editor instance, this is unproblematic,
  but will need to be handled once we have multiple tabs
*/
tabs.onSelectionChanged = function(id) {
   var selection = tabs.editors[id].getSession().selection,
       sendSelectionButton = document.getElementById("sendSelectedEditorContent"),
       evalSelectionButton = document.getElementById("evalSelectedEditorContent"); // should be cached - FIXME

   // check whether empty selection
   if ( selection.isEmpty()) {
      if(sendSelectionButton.style.display != "none") {
         sendSelectionButton.style.display = "none";
      }
      if(evalSelectionButton.style.display != "none") {
         evalSelectionButton.style.display = "none";
      }
   }
   else {
      if(sendSelectionButton.style.display === "none") {
         sendSelectionButton.style.display = "block";
      }
      if(tabs.tabs[id].eval === true && evalSelectionButton.style.display === "none") {
         evalSelectionButton.style.display = "block";
      }
   }
};

/*
   Sends the current content of the Ace editor div
*/
tabs.sendFullEditorContent = function() {

   var body = tabs.editors[tabs.focusedTab].getValue(),
       language = tabs.tabs[tabs.focusedTab].language;

   tabs.sendMessage(tabs.constructMessage(body, language));
};

/*
   Sends the content currently selected in the Ace editor div
*/
tabs.sendSelectedEditorContent = function() {
   var body = tabs.editors[tabs.focusedTab].session.getTextRange(tabs.editors[tabs.focusedTab].getSelectionRange()),
       language = tabs.tabs[tabs.focusedTab].language;

   tabs.sendMessage(tabs.constructMessage(body, language));
};

tabs.evalFullEditorContent = function() {
   var code = tabs.editors[tabs.focusedTab].getValue(),
       context = tabs.tabs[tabs.focusedTab].connection.context;
   // tabs.runInContext(context, "console.log(session.sessionid());");
   // tabs.runInContext(context, "console.log(this);")
   tabs.runInContext(context, code);
   tabs.showEvaluatedMessage(true);
};
tabs.evalSelectedEditorContent = function() {
   var code = tabs.editors[tabs.focusedTab].session.getTextRange(tabs.editors[tabs.focusedTab].getSelectionRange()),
       context = tabs.tabs[tabs.focusedTab].connection.context;
   tabs.runInContext(context, code);
   tabs.showEvaluatedMessage(false);
};
tabs.showEvaluatedMessage = function(evalFull) {
   var part = evalFull ? "full" : "selected",
       messageBox = document.getElementById("evaluatedMessage");

   messageBox.textContent = "Evaluated " + part + " code from this tab.";
   $(messageBox).removeClass("nonDisplay");
   window.setTimeout(function(){ $(messageBox).addClass("nonDisplay");}, 2000)

};

/*
   Constructs the message to be sent
*/
tabs.constructMessage = function(body, language) {
   var message = {
      channel: connect.subscribedChannel,
      nick: chat.nick,
      title: tabs.tabs[tabs.focusedTab].titleInput.value,
      // title: tabs.titles[tabs.focusedTab].value,
      body: body,
      syntax: language
   };
   return message;
};

/*
   The actual sending of the constructed message
*/
tabs.sendMessage = function (message) {
   connect.sess.call(connect.channelBaseUri + "#post", message).then(ab.log, ab.log); // include some error handling
};


/*
  Chat code
*/

var chat = {
   messagesBox: document.getElementById("chatMessageContainer"),
   chatCodeBlocks: {},
   nick: "",
   fontSizeSelector: null
};

/*
   initializes the chat part of the demo
   needs to be called on first run + after a channel change - CHECKME
*/
chat.initialize = function() {
   // get the CSS selector that sets the chat font size
   
   // we know which CSS class we are looking for, so store this
   var myClass = ".chatCodeBlock"; // needs to be the full selector as in the CSS !!!

   // get the style sheets for the document
   var styleSheets = document.styleSheets;

   // loop over to find our class
   var rulesId = document.all ? "rules" : "cssRules"; // IE<10(?) or rest of world
   // loop over style sheets
   for(var i = 0; i < styleSheets.length; i++) {
      var rules = styleSheets[i][rulesId], // is object, not array
          rulesLength = rules.length; // object property
      for(var c = 0; c < rulesLength; c++) {
         if(rules[c].selectorText === myClass) {
            chat.fontSizeSelector = rules[c];
         }
      }
   }

   // set the initial default font size for the chat
   chat.setFontSize(configuration.currentFontSize);
};

chat.getStoredChatMessages = function() {
   // get stored chat messages for the present channel
   connect.sess.call(connect.channelBaseUri + "#get", { channel: connect.subscribedChannel}).then(function(msgs) {
      for(var i = 0; i < msgs.length; i++) {
         chat.addMessage(msgs[i]);
      }
   }, ab.log);
};

chat.setFontSize = function(fontSize) {

   chat.fontSizeSelector.style.fontSize = fontSize + "px";

   // // the quick & dirty alternative:
   // var chatBlocks = document.getElementsByClassName("chatCodeBlock");
   // for(var d = 0; d < chatBlocks.length; d++) {
   //    chatBlocks[i].style.fontSize = fontSize + "px";
   // }

};

chat.onMessage = function(topicUri, event) {
   
   // filter out only messages for the current channel
   if(event.channel === connect.subscribedChannel) {
      chat.addMessage(event);
   }
};

// could use some breaking out of smaller functions - FIXME
chat.addMessage = function(event) {
   // get the parts of the message event
   var nick = event.nick,
       title = event.title,
       time = event.published,
       language = event.syntax,
       body = event.body,
       id = event.id;

   // time formatting
   var dateTime = new Date(time),
       hours = dateTime.getHours(),
       minutes = dateTime.getMinutes(),
       day = dateTime.getDate(),
       month = dateTime.getMonth() + 1,
       year = dateTime.getFullYear();
   // zero-pad any single digit values
   var format = [hours, minutes, day, month];
   for (var i = 0; i < format.length; i++)      {
      if (format[i]< 10) {
         format[i] = "0" + format[i];
      }
      else {
         format[i] = format[i].toString();
      }
   }
   var timeString = format[0] + ":" + format[1] + " - " + format[2] + "." + format[3] + "." + year;

   // store the code for later pasting into the editor
   chat.chatCodeBlocks[id] = {"body": body, "language": language, "title": title};
   
   var displayMessage = document.createElement("div");
   displayMessage.classList.add("chatMessage");
   
   // construct the message chrome
   var header = document.createElement("div");
   header.classList.add("chatHeader");
   header.innerHTML = "<span class='messageId'>Post " + id + "</span><span class='messageLanguage'>" + tabs.localToDisplay[language] + "</span><div class='messageTitle' style='color: rgba(0, 0, 0, 0.6)'>" + title + "</div><span class='messageTime'>" + timeString + "</span><span class='messageNick'>" + nick + "</span>";
   displayMessage.appendChild(header);

   // construct the message body
   var messageBody = document.createElement("div");
   messageBody.classList.add("chatCodeBlock");

   // figure out which brush to use
   var brush = tabs.localToSyntaxhighlighter[language];

   // add the code with code higlighter framing
   messageBody.innerHTML = "<pre class='brush: " + brush +"; toolbar: false; gutter: true; auto-links: false; highlight: []'>" + body + "</pre>";

   // add the copy button
   var copyButton = document.createElement("button");
   copyButton.classList.add("copyButton");
   copyButton.innerHTML = "Copy";
   var cbId = id;
   copyButton.addEventListener("click", function() {
         chat.copyCodeBlockFromChat(cbId);
   });
   messageBody.appendChild(copyButton);

   displayMessage.appendChild(messageBody);
   
   chat.messagesBox.appendChild(displayMessage);

   // trigger re-run of syntaxHighligher
   SyntaxHighlighter.highlight();

   // scroll messages box
   chat.messagesBox.scrollTop = chat.messagesBox.scrollHeight;

};

chat.copyCodeBlockFromChat = function(cbid) {
   var language = chat.chatCodeBlocks[cbid].language,
       body = chat.chatCodeBlocks[cbid].body;

   // check language compatibility
   var editor;
   var selectedEditor = tabs.editors[tabs.focusedTab];
   var editorLanguage = tabs.tabs[tabs.focusedTab].language;

   // pick a tab to paste into or create one if needed
   var lastFocused;
   if(editorLanguage === language) {
      // languages match, stay within current editor
      editor = selectedEditor;
   } else if (tabs.languages[language] && tabs.languages[language].openTabs > 0) {
      // switch to the last focused tab for the language
      lastFocused = tabs.languages[language].lastFocused;
      tabs.switchTab(lastFocused);
      editor = tabs.editors[lastFocused];
   } else {
      // need to create tab for language to paste into
      tabs.addTab(language);
      lastFocused = tabs.languages[language].lastFocused;
      editor = tabs.editors[lastFocused];
   }

   // variant 1: just copy the content into the chosen
   // editor at the current cursor position
   // editor.insert(content);
   
   // variant 2:  insert the content at the end of the current content of the editor,
   //             if some current content, else just paste
   if(editor.getValue() === "") {
      editor.insert(body);
   } else {
      editor.navigateFileEnd(); // moves to the end of the current file/document
      // need to add a line breaks before pasting
      var currentRow = editor.getCursorPosition().row;
      editor.session.getDocument().insertLines(currentRow + 1, ["", ""]);
      editor.insert(body);
   }
   
};

var configuration = {
   defaultLanguage: "js",
   defaultFontSize: 16,
   currentFontSize: 16,
   fontStepSize: 1
};

housekeeping.initialize();
// })(); // make all self-executing anonymous function to clear the global scope & 
// avoid problems with eval. does not exclude loaded libraries, but works in principle