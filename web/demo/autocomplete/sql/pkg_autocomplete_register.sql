BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_autocomplete TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_autocomplete');
   webmq.export('pkg_autocomplete', 'search', pkg_autocomplete.BASEURI || 'search');
   webmq.export('pkg_autocomplete', 'count',  pkg_autocomplete.BASEURI || 'count');
   webmq.export('pkg_autocomplete', 'get',    pkg_autocomplete.BASEURI || 'get');
END;
/
