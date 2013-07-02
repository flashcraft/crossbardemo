CREATE OR REPLACE PACKAGE pkg_codechat
AS
   /**
    * Backend for Codechat demo.
    *
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    */

   /**
    * RPC/Event URI prefix
    */
   BASEURI CONSTANT VARCHAR2(200) := 'http://tavendo.de/webmq/demo/codechat#';

   /**
    * Submit a new post.
    */
   FUNCTION post (p_post JSON) RETURN NUMBER;

   /**
    * Get posts history.
    */
   FUNCTION get (p_params JSON) RETURN JSON_LIST;

   /**
    * Get channels.
    */
   FUNCTION channels RETURN JSON_LIST;

   /**
    * Purge history for given channel;
    */
   FUNCTION purge (p_channel VARCHAR2) RETURN NUMBER;

END;
/
