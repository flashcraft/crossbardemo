BEGIN
   --
   -- Crossbar.io needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee1 TO ' || crossbar.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with Crossbar.io
   --
   crossbar.remove_exports('pkg_testee1');

   --
   -- 3.1 Argument and return types (Number)
   --
   crossbar.export('pkg_testee1', 'echo_number1',  pkg_testee_common.URI_CASE || '3.1.1#1');
   crossbar.export('pkg_testee1', 'echo_number2',  pkg_testee_common.URI_CASE || '3.1.1#2');
   crossbar.export('pkg_testee1', 'echo_number3',  pkg_testee_common.URI_CASE || '3.1.1#3');
   crossbar.export('pkg_testee1', 'echo_number4',  pkg_testee_common.URI_CASE || '3.1.1#4');

   crossbar.export('pkg_testee1', 'add_number1',  pkg_testee_common.URI_CASE || '3.1.2#1');
   crossbar.export('pkg_testee1', 'add_number2',  pkg_testee_common.URI_CASE || '3.1.2#2');
   crossbar.export('pkg_testee1', 'add_number3',  pkg_testee_common.URI_CASE || '3.1.2#3');
   crossbar.export('pkg_testee1', 'add_number4',  pkg_testee_common.URI_CASE || '3.1.2#4');

   --
   -- 3.2 Argument and return types (String)
   --
   crossbar.export('pkg_testee1', 'echo_string1',  pkg_testee_common.URI_CASE || '3.2.1#1');
   crossbar.export('pkg_testee1', 'echo_string2',  pkg_testee_common.URI_CASE || '3.2.1#2');
   crossbar.export('pkg_testee1', 'echo_string3',  pkg_testee_common.URI_CASE || '3.2.1#3');
   crossbar.export('pkg_testee1', 'echo_string4',  pkg_testee_common.URI_CASE || '3.2.1#4');

   crossbar.export('pkg_testee1', 'len_string1',  pkg_testee_common.URI_CASE || '3.2.2#1');
   crossbar.export('pkg_testee1', 'len_string2',  pkg_testee_common.URI_CASE || '3.2.2#2');
   crossbar.export('pkg_testee1', 'len_string3',  pkg_testee_common.URI_CASE || '3.2.2#3');
   crossbar.export('pkg_testee1', 'len_string4',  pkg_testee_common.URI_CASE || '3.2.2#4');

   crossbar.export('pkg_testee1', 'reverse_string1',  pkg_testee_common.URI_CASE || '3.2.3#1');
   crossbar.export('pkg_testee1', 'reverse_string2',  pkg_testee_common.URI_CASE || '3.2.3#2');
   crossbar.export('pkg_testee1', 'reverse_string3',  pkg_testee_common.URI_CASE || '3.2.3#3');
   crossbar.export('pkg_testee1', 'reverse_string4',  pkg_testee_common.URI_CASE || '3.2.3#4');

   crossbar.export('pkg_testee1', 'concat_string1',  pkg_testee_common.URI_CASE || '3.2.4#1');
   crossbar.export('pkg_testee1', 'concat_string2',  pkg_testee_common.URI_CASE || '3.2.4#2');
   crossbar.export('pkg_testee1', 'concat_string3',  pkg_testee_common.URI_CASE || '3.2.4#3');
   crossbar.export('pkg_testee1', 'concat_string4',  pkg_testee_common.URI_CASE || '3.2.4#4');

   --
   -- 3.3 Argument and return types (Datetime)
   --
   crossbar.export('pkg_testee1', 'echo_date1',  pkg_testee_common.URI_CASE || '3.3.1#1');
   crossbar.export('pkg_testee1', 'echo_date2',  pkg_testee_common.URI_CASE || '3.3.1#2');
   crossbar.export('pkg_testee1', 'echo_date3',  pkg_testee_common.URI_CASE || '3.3.1#3');
   crossbar.export('pkg_testee1', 'echo_date4',  pkg_testee_common.URI_CASE || '3.3.1#4');

   crossbar.export('pkg_testee1', 'get_date1',  pkg_testee_common.URI_CASE || '3.3.2#1');
   crossbar.export('pkg_testee1', 'get_date2',  pkg_testee_common.URI_CASE || '3.3.2#2');
   crossbar.export('pkg_testee1', 'get_date3',  pkg_testee_common.URI_CASE || '3.3.2#3');
   crossbar.export('pkg_testee1', 'get_date4',  pkg_testee_common.URI_CASE || '3.3.2#4');

   crossbar.export('pkg_testee1', 'add_date1',  pkg_testee_common.URI_CASE || '3.3.3#1');
   crossbar.export('pkg_testee1', 'add_date2',  pkg_testee_common.URI_CASE || '3.3.3#2');
   crossbar.export('pkg_testee1', 'add_date3',  pkg_testee_common.URI_CASE || '3.3.3#3');
   crossbar.export('pkg_testee1', 'add_date4',  pkg_testee_common.URI_CASE || '3.3.3#4');

   --
   -- 3.4 Argument and return types (Boolean)
   --
   --crossbar.export('pkg_testee1', 'echo_bool1',  pkg_testee_common.URI_CASE || '3.4.1#1');
   crossbar.export('pkg_testee1', 'echo_bool2',  pkg_testee_common.URI_CASE || '3.4.1#2');

   --crossbar.export('pkg_testee1', 'xor_bool1',  pkg_testee_common.URI_CASE || '3.4.2#1');
   crossbar.export('pkg_testee1', 'xor_bool2',  pkg_testee_common.URI_CASE || '3.4.2#2');
END;
/
