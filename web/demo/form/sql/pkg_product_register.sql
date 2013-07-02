BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_product TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_product');
   webmq.export('pkg_product', 'crud_create', pkg_product.BASEURI || 'create');
   webmq.export('pkg_product', 'crud_read',   pkg_product.BASEURI || 'read');
   webmq.export('pkg_product', 'crud_update', pkg_product.BASEURI || 'update');
   webmq.export('pkg_product', 'crud_delete', pkg_product.BASEURI || 'delete');
   webmq.export('pkg_product', 'filter',      pkg_product.BASEURI || 'filter');
END;
/
