/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

/**
 * Dynamically get appliance URLs.
 *
 * This issues a synchronous AJAX request to get the port/TLS for the
 * requested appliance service and construct the corresponding URL.
 *
 * Valid service requests are:
 *    admin-websocket
 *    admin-web
 *    hub-website
 *    hub-websocket
 *    hub-push
 *
 * An option fallback_url parameter can be given which is used when
 * the Admin UI is loaded from a local file.
 *
 * An optional timeout for port retrieval can be given in ms.
 * Default timeout is 3s.
 */
function get_appliance_url(service, fallback_url, timeout) {

   if (window.location.protocol === "file:") {

      if (fallback_url == null) {
         throw "Admin UI running from local file and no fallback URL given";
      }

      return fallback_url;

   } else {


      var res = new XMLHttpRequest();
      var svc = (service == "hub-website" ? "hub-websocket" : service);
      res.open('GET', "/wsconfig/" + svc, false);
      res.send(null);

      if (res.status == 200) {
         try {
            var _port = JSON.parse(res.responseText);
            //console.log(_port);
            switch (service){
               case "admin-websocket":
               case "hub-website":
               case "hub-websocket":
                  var port = "";
                  if (!((_port[1] && _port[0] == 443) || (!_port[1] && _port[0] == 80))) {
                     port = ":" + _port[0];
                  }
                  var schema;
                  var path;
                  if (service == "hub-website") {
                     schema = _port[1] ? "https" : "http";
                     path = "/";
                  } else {
                     schema = _port[1] ? "wss" : "ws";
                     path = "/" + _port[2];
                  }
                  var uri = schema + "://" + window.location.hostname + port + path;
                  return uri;
                  break;
               case "admin-web":
               case "hub-web":
                  var uri = (_port[1] ? "https" : "http") + "://" + window.location.hostname + ":" + _port[0];
                  return uri;
                  break;
               default:
                  return ("service not recognized", service);
                  break;

               var uri = (_port[1] ? "https" : "http") + "://" + window.location.hostname + ":" + _port[0];
               return uri;

            }

         } catch (e) {
            return null;
         }
      } else {
         return null;
      }
   }
}


function getWebMQURL(fallback_url) {
   return get_appliance_url("hub-websocket", fallback_url);
}


function httpGet(theUrl) {
   var xmlHttp = null;

   xmlHttp = new XMLHttpRequest();
   xmlHttp.open( "GET", theUrl, false );
   xmlHttp.send( null );
   return xmlHttp.responseText;
}
