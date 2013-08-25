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
   PROCEDURE raise_internal1 (val NUMBER);


   /**
    * Raises a custome exception iff val == 0.
    * Else, success with no return value.
    * The exception has URI = 
    *
    * session.call("http://api.testsuite.wamp.ws/case/1.8.2", 0).then(session.log, session.log);
    */
   PROCEDURE raise_internal2 (val NUMBER);

   PROCEDURE raise_internal3 (val NUMBER);

   PROCEDURE raise_internal4 (val NUMBER);

   PROCEDURE raise_internal5 (val NUMBER);

   PROCEDURE raise_internal6 (val NUMBER);

END;
/
