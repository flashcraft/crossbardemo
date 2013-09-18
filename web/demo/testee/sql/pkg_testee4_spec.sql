CREATE OR REPLACE PACKAGE pkg_testee4
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Exceptions.
    *
    * Cases: 3.6.*, 3.7.*
    */

   PROCEDURE initiate_dispatch (topic VARCHAR2, event JSON_VALUE, options JSON);
END;
/
