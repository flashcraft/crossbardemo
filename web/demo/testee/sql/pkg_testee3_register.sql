BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee3 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee3');

   webmq.export('pkg_testee3', 'raise_internal1',  pkg_testee_common.URI_CASE || '1.8.1');
   webmq.export('pkg_testee3', 'raise_internal2',  pkg_testee_common.URI_CASE || '1.8.2');
   webmq.export('pkg_testee3', 'raise_internal3',  pkg_testee_common.URI_CASE || '1.8.3');
   webmq.export('pkg_testee3', 'raise_internal4',  pkg_testee_common.URI_CASE || '1.8.4');
   webmq.export('pkg_testee3', 'raise_internal5',  pkg_testee_common.URI_CASE || '1.8.5');
   webmq.export('pkg_testee3', 'raise_internal6',  pkg_testee_common.URI_CASE || '1.8.6');
END;
/
