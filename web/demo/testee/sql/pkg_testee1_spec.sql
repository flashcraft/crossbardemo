CREATE OR REPLACE PACKAGE pkg_testee1
AS
   /**
    * AutobahnTestsuite testee package.
    *
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    */

   /**
    * RPC/Event URI prefix
    */
   BASEURI CONSTANT VARCHAR2(200) := 'http://testsuite.wamp.ws#';

   FUNCTION add2 (x NUMBER, y NUMBER) RETURN NUMBER;

END;
/
