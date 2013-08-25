BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee1 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee1');

   webmq.export('pkg_testee1', 'echo_string1',  pkg_testee1.BASEURI || 'case1_1_1');
   webmq.export('pkg_testee1', 'echo_string2',  pkg_testee1.BASEURI || 'case1_1_2');
   webmq.export('pkg_testee1', 'echo_string3',  pkg_testee1.BASEURI || 'case1_1_3');
   webmq.export('pkg_testee1', 'echo_string4',  pkg_testee1.BASEURI || 'case1_1_4');

   webmq.export('pkg_testee1', 'concat_string1',  pkg_testee1.BASEURI || 'case1_1_5');

   webmq.export('pkg_testee1', 'echo_number1',  pkg_testee1.BASEURI || 'case1_2_1');
   webmq.export('pkg_testee1', 'echo_number2',  pkg_testee1.BASEURI || 'case1_2_2');
   webmq.export('pkg_testee1', 'echo_number3',  pkg_testee1.BASEURI || 'case1_2_3');

   webmq.export('pkg_testee1', 'add_number1',  pkg_testee1.BASEURI || 'case1_2_4');
   webmq.export('pkg_testee1', 'add_number2',  pkg_testee1.BASEURI || 'case1_2_5');

   webmq.export('pkg_testee1', 'echo_date1',  pkg_testee1.BASEURI || 'case1_3_1');

   webmq.export('pkg_testee1', 'get_date1',  pkg_testee1.BASEURI || 'case1_4_1');
   webmq.export('pkg_testee1', 'get_date2',  pkg_testee1.BASEURI || 'case1_4_2');
   webmq.export('pkg_testee1', 'get_date3',  pkg_testee1.BASEURI || 'case1_4_3');
   webmq.export('pkg_testee1', 'get_date4',  pkg_testee1.BASEURI || 'case1_4_4');

   webmq.export('pkg_testee1', 'add_date1',  pkg_testee1.BASEURI || 'case1_4_5');
END;
/
