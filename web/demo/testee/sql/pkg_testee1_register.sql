BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee1 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee1');

   webmq.export('pkg_testee1', 'echo_string1',  pkg_testee_common.URI_CASE || '1.1.1');
   webmq.export('pkg_testee1', 'echo_string2',  pkg_testee_common.URI_CASE || '1.1.2');
   webmq.export('pkg_testee1', 'echo_string3',  pkg_testee_common.URI_CASE || '1.1.3');
   webmq.export('pkg_testee1', 'echo_string4',  pkg_testee_common.URI_CASE || '1.1.4');

   webmq.export('pkg_testee1', 'concat_string1',  pkg_testee_common.URI_CASE || '1.1.5');

   webmq.export('pkg_testee1', 'echo_number1',  pkg_testee_common.URI_CASE || '1.2.1');
   webmq.export('pkg_testee1', 'echo_number2',  pkg_testee_common.URI_CASE || '1.2.2');
   webmq.export('pkg_testee1', 'echo_number3',  pkg_testee_common.URI_CASE || '1.2.3');

   webmq.export('pkg_testee1', 'add_number1',  pkg_testee_common.URI_CASE || '1.2.4');
   webmq.export('pkg_testee1', 'add_number2',  pkg_testee_common.URI_CASE || '1.2.5');

   webmq.export('pkg_testee1', 'echo_date1',  pkg_testee_common.URI_CASE || '1.3.1');

   webmq.export('pkg_testee1', 'get_date1',  pkg_testee_common.URI_CASE || '1.4.1');
   webmq.export('pkg_testee1', 'get_date2',  pkg_testee_common.URI_CASE || '1.4.2');
   webmq.export('pkg_testee1', 'get_date3',  pkg_testee_common.URI_CASE || '1.4.3');
   webmq.export('pkg_testee1', 'get_date4',  pkg_testee_common.URI_CASE || '1.4.4');

   webmq.export('pkg_testee1', 'add_date1',  pkg_testee_common.URI_CASE || '1.4.5');
END;
/
