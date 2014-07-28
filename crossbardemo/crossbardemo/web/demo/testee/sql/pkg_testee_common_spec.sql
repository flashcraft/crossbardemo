CREATE OR REPLACE PACKAGE pkg_testee_common
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite.
    */

   /**
    * WAMP testsuite API base URI.
    */
   URI_BASE CONSTANT VARCHAR2(200) := 'http://api.testsuite.wamp.ws';

   /**
    * WAMP testsuite test cases base URI.
    */
   URI_CASE CONSTANT VARCHAR2(200) := 'http://api.testsuite.wamp.ws/case/';

   /**
    * WAMP testsuite error base URI.
    */
   URI_ERROR CONSTANT VARCHAR2(200) := 'http://api.testsuite.wamp.ws/error#';

END;
/
