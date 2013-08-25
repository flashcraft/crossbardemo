BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee3 TO ' || webmq.REPOUSER;

   webmq.remove_exports('pkg_testee3');

   webmq.export('pkg_testee3', 'raise_internal',  pkg_testee_common.URI_CASE || '1.8.1');

   webmq.export('pkg_testee3', 'raise_custom_u',  pkg_testee_common.URI_CASE || '1.8.2');
   webmq.export('pkg_testee3', 'raise_custom_ud',  pkg_testee_common.URI_CASE || '1.8.3');
   webmq.export('pkg_testee3', 'raise_custom_udd_s',  pkg_testee_common.URI_CASE || '1.8.4');
   webmq.export('pkg_testee3', 'raise_custom_udd_o',  pkg_testee_common.URI_CASE || '1.8.5');
   webmq.export('pkg_testee3', 'raise_custom_udd_a',  pkg_testee_common.URI_CASE || '1.8.6');

   webmq.export('pkg_testee3', 'raise_drop_custom_u',  pkg_testee_common.URI_CASE || '1.9.2');
   webmq.export('pkg_testee3', 'raise_drop_custom_ud',  pkg_testee_common.URI_CASE || '1.9.3');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_s',  pkg_testee_common.URI_CASE || '1.9.4');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_o',  pkg_testee_common.URI_CASE || '1.9.5');
   webmq.export('pkg_testee3', 'raise_drop_custom_udd_a',  pkg_testee_common.URI_CASE || '1.9.6');

   webmq.export('pkg_testee3', 'raise_echo',  pkg_testee_common.URI_CASE || '1.8.7');
   webmq.export('pkg_testee3', 'raise_drop_echo',  pkg_testee_common.URI_CASE || '1.9.7');
END;
/
