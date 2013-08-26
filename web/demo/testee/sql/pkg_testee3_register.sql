BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee3 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee3');

   webmq.export('pkg_testee3', 'raise_internal',  pkg_testee_common.URI_CASE || '3.6.1');

   webmq.export('pkg_testee3', 'raise_custom_u',  pkg_testee_common.URI_CASE || '3.7.1');
   webmq.export('pkg_testee3', 'raise_custom_ud',  pkg_testee_common.URI_CASE || '3.7.2');
   webmq.export('pkg_testee3', 'raise_custom_udd_s',  pkg_testee_common.URI_CASE || '3.7.3');
   webmq.export('pkg_testee3', 'raise_custom_udd_o',  pkg_testee_common.URI_CASE || '3.7.4');
   webmq.export('pkg_testee3', 'raise_custom_udd_a',  pkg_testee_common.URI_CASE || '3.7.5');

   webmq.export('pkg_testee3', 'raise_drop_custom_u',  pkg_testee_common.URI_CASE || '3.7.6');
   webmq.export('pkg_testee3', 'raise_drop_custom_ud',  pkg_testee_common.URI_CASE || '3.7.7');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_s',  pkg_testee_common.URI_CASE || '3.7.8');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_o',  pkg_testee_common.URI_CASE || '3.7.9');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_a',  pkg_testee_common.URI_CASE || '3.7.10');

   webmq.export('pkg_testee3', 'raise_echo',  pkg_testee_common.URI_CASE || '3.7.11');
   webmq.export('pkg_testee3', 'raise_drop_echo',  pkg_testee_common.URI_CASE || '3.7.12');
END;
/
