CREATE OR REPLACE PACKAGE pkg_testee4
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Server-initiated Events.
    *
    * Cases: 2.3.*, 2.4.*
    */

   /**
    * Using this procedure, the test suite will trigger a server-initiated
    * event. Normally, server-initiated events are triggered by server-side
    * code, but the test suite needs a control API to simulate this.
    *
    * @param topic: The topic to publish to.
    * @param event: The event payload.
    * @param options: Publication options. May have have controlling attributes:
    *                   - 'exclude' (list of WAMP session IDs)
    *                   - 'eligible' (list of WAMP session IDs)
    *                   - 'excludeMe' (bool)
    *                 and always has the informational attributes:
    *                   - 'me' (publisher WAMP session ID).
    */
   FUNCTION initiate_dispatch (topic VARCHAR2, event JSON_VALUE, options JSON) RETURN NUMBER;
END;
/

SHOW ERRORS
/
