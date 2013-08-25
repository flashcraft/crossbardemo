BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee2 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee2');

--   webmq.export('pkg_testee2', 'echo_string1',  pkg_testee_common.URI_CASE || '1.1.1');
END;
/
