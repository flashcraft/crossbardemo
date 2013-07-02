CREATE OR REPLACE PACKAGE pkg_product
AS
   /**
    * Backend for Editform and Gridfilter demos.
    *
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    */

   /**
    * RPC/Event URI prefix
    */
   BASEURI CONSTANT VARCHAR2(200) := 'http://tavendo.de/webmq/demo/koform#';

   /**
    * Get objects. This procedure can drive ExtJS grids and properly
    * does query pagination.
    */
   FUNCTION crud_read (p_params JSON) RETURN JSON_LIST;

   /**
    * Create a new object.
    */
   FUNCTION crud_create (p_obj JSON, p_sess WEBMQ_SESSION) RETURN JSON;

   /**
    * Update existing object.
    */
   FUNCTION crud_update (p_obj JSON, p_sess WEBMQ_SESSION) RETURN JSON;

   /**
    * Delete an object given by ID.
    */
   PROCEDURE crud_delete (p_id NUMBER, p_sess WEBMQ_SESSION);

   /**
    * Get objects by filter.
    *
    * Example:
    *   session.call("http://tavendo.de/webmq/demo/koform#filter", {name: {value: 'S', type: 'prefix'}}, 10).then(ab.log, ab.log);
    *
    *      NAME         TYPE
    *      --------------------------------------
    *      name         prefix, includes
    *      price        gte, lte
    */
   FUNCTION filter (p_filter JSON, p_limit NUMBER) RETURN JSON_LIST;
END;
/
