CREATE OR REPLACE PACKAGE pkg_testee3
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Exceptions.
    */

   /**
    * Raises an Oracle triggered ("internal") exception iff val == 0.
    * Else, success with no return value.
    */


   /**
    * Raises a custome exception iff val == 0.
    * Else, success with no return value.
    * The exception has URI =
    * 
    * Depending on x and y, returns nothing, raises
    * or raises and drops.
    *
    * session.call("http://api.testsuite.wamp.ws/case/1.8.2", 0).then(session.log, session.log);
    */


   PROCEDURE raise_internal1 (x NUMBER);

   PROCEDURE raise_internal2 (x NUMBER);
   PROCEDURE raise_internal3 (x NUMBER);
   PROCEDURE raise_internal4 (x NUMBER);
   PROCEDURE raise_internal5 (x NUMBER);
   PROCEDURE raise_internal6 (x NUMBER);

   PROCEDURE raise_internal2drop (x NUMBER);
   PROCEDURE raise_internal3drop (x NUMBER);
   PROCEDURE raise_internal4drop (x NUMBER);
   PROCEDURE raise_internal5drop (x NUMBER);
   PROCEDURE raise_internal6drop (x NUMBER);

   -- different scalar details type
   -- echo uri, desc, details
   -- drop connection

END;
/
