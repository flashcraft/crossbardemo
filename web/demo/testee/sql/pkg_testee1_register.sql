BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee1 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee1');

   --
   -- 3.1 Argument and return types (Number)
   --
   webmq.export('pkg_testee1', 'echo_number1',  pkg_testee_common.URI_CASE || '3.1.1#1');
   webmq.export('pkg_testee1', 'echo_number2',  pkg_testee_common.URI_CASE || '3.1.1#2');
   webmq.export('pkg_testee1', 'echo_number3',  pkg_testee_common.URI_CASE || '3.1.1#3');
   webmq.export('pkg_testee1', 'echo_number4',  pkg_testee_common.URI_CASE || '3.1.1#4');

   webmq.export('pkg_testee1', 'add_number1',  pkg_testee_common.URI_CASE || '3.1.2#1');
   webmq.export('pkg_testee1', 'add_number2',  pkg_testee_common.URI_CASE || '3.1.2#2');
   webmq.export('pkg_testee1', 'add_number3',  pkg_testee_common.URI_CASE || '3.1.2#3');
   webmq.export('pkg_testee1', 'add_number4',  pkg_testee_common.URI_CASE || '3.1.2#4');

   --
   -- 3.2 Argument and return types (String)
   --
   webmq.export('pkg_testee1', 'echo_string1',  pkg_testee_common.URI_CASE || '3.2.1#1');
   webmq.export('pkg_testee1', 'echo_string2',  pkg_testee_common.URI_CASE || '3.2.1#2');
   webmq.export('pkg_testee1', 'echo_string3',  pkg_testee_common.URI_CASE || '3.2.1#3');
   webmq.export('pkg_testee1', 'echo_string4',  pkg_testee_common.URI_CASE || '3.2.1#4');

   webmq.export('pkg_testee1', 'len_string1',  pkg_testee_common.URI_CASE || '3.2.2#1');
   webmq.export('pkg_testee1', 'len_string2',  pkg_testee_common.URI_CASE || '3.2.2#2');
   webmq.export('pkg_testee1', 'len_string3',  pkg_testee_common.URI_CASE || '3.2.2#3');
   webmq.export('pkg_testee1', 'len_string4',  pkg_testee_common.URI_CASE || '3.2.2#4');

   webmq.export('pkg_testee1', 'reverse_string1',  pkg_testee_common.URI_CASE || '3.2.3#1');
   webmq.export('pkg_testee1', 'reverse_string2',  pkg_testee_common.URI_CASE || '3.2.3#2');
   webmq.export('pkg_testee1', 'reverse_string3',  pkg_testee_common.URI_CASE || '3.2.3#3');
   webmq.export('pkg_testee1', 'reverse_string4',  pkg_testee_common.URI_CASE || '3.2.3#4');

   webmq.export('pkg_testee1', 'concat_string1',  pkg_testee_common.URI_CASE || '3.2.4#1');
   webmq.export('pkg_testee1', 'concat_string2',  pkg_testee_common.URI_CASE || '3.2.4#2');
   webmq.export('pkg_testee1', 'concat_string3',  pkg_testee_common.URI_CASE || '3.2.4#3');
   webmq.export('pkg_testee1', 'concat_string4',  pkg_testee_common.URI_CASE || '3.2.4#4');

   --
   -- 3.3 Argument and return types (Datetime)
   --
   webmq.export('pkg_testee1', 'echo_date1',  pkg_testee_common.URI_CASE || '3.3.1#1');
   webmq.export('pkg_testee1', 'echo_date2',  pkg_testee_common.URI_CASE || '3.3.1#2');
   webmq.export('pkg_testee1', 'echo_date3',  pkg_testee_common.URI_CASE || '3.3.1#3');
   webmq.export('pkg_testee1', 'echo_date4',  pkg_testee_common.URI_CASE || '3.3.1#4');

   webmq.export('pkg_testee1', 'get_date1',  pkg_testee_common.URI_CASE || '3.3.2#1');
   webmq.export('pkg_testee1', 'get_date2',  pkg_testee_common.URI_CASE || '3.3.2#2');
   webmq.export('pkg_testee1', 'get_date3',  pkg_testee_common.URI_CASE || '3.3.2#3');
   webmq.export('pkg_testee1', 'get_date4',  pkg_testee_common.URI_CASE || '3.3.2#4');

   webmq.export('pkg_testee1', 'add_date1',  pkg_testee_common.URI_CASE || '3.3.3#1');
   webmq.export('pkg_testee1', 'add_date2',  pkg_testee_common.URI_CASE || '3.3.3#2');
   webmq.export('pkg_testee1', 'add_date3',  pkg_testee_common.URI_CASE || '3.3.3#3');
   webmq.export('pkg_testee1', 'add_date4',  pkg_testee_common.URI_CASE || '3.3.3#4');

   --
   -- 3.4 Argument and return types (Boolean)
   --
   --webmq.export('pkg_testee1', 'echo_bool1',  pkg_testee_common.URI_CASE || '3.4.1#1');
   webmq.export('pkg_testee1', 'echo_bool2',  pkg_testee_common.URI_CASE || '3.4.1#2');

   --webmq.export('pkg_testee1', 'xor_bool1',  pkg_testee_common.URI_CASE || '3.4.2#1');
   webmq.export('pkg_testee1', 'xor_bool2',  pkg_testee_common.URI_CASE || '3.4.2#2');
END;
/
