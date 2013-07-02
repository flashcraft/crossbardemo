CREATE OR REPLACE PACKAGE pkg_vote
AS
   /**
    * Backend for Votes demo.
    *
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    */

   /**
    * RPC/Event URI prefix
    */
   BASEURI CONSTANT VARCHAR2(200) := 'http://tavendo.de/webmq/demo/vote#';

   /**
    * Get votes.
    */
   FUNCTION get RETURN JSON_LIST;

   /**
    * Submit a vote.
    */
   FUNCTION vote (p_subject VARCHAR2) RETURN NUMBER;

   /**
    * Reset votes.
    */
   PROCEDURE reset;

END;
/
