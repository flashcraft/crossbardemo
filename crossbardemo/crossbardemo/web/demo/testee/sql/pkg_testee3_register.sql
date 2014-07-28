BEGIN
   --
   -- Crossbar.io needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee3 TO ' || crossbar.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with Crossbar.io
   --
   crossbar.remove_exports('pkg_testee3');

   crossbar.export('pkg_testee3', 'raise_internal',  pkg_testee_common.URI_CASE || '3.6.1');

   crossbar.export('pkg_testee3', 'raise_custom_u',  pkg_testee_common.URI_CASE || '3.7.1');
   crossbar.export('pkg_testee3', 'raise_custom_ud',  pkg_testee_common.URI_CASE || '3.7.2');
   crossbar.export('pkg_testee3', 'raise_custom_udd_s',  pkg_testee_common.URI_CASE || '3.7.3');
   crossbar.export('pkg_testee3', 'raise_custom_udd_o',  pkg_testee_common.URI_CASE || '3.7.4');
   crossbar.export('pkg_testee3', 'raise_custom_udd_a',  pkg_testee_common.URI_CASE || '3.7.5');

   crossbar.export('pkg_testee3', 'raise_drop_custom_u',  pkg_testee_common.URI_CASE || '3.7.6');
   crossbar.export('pkg_testee3', 'raise_drop_custom_ud',  pkg_testee_common.URI_CASE || '3.7.7');
   crossbar.export('pkg_testee3', 'raise_drop_custom_udd_s',  pkg_testee_common.URI_CASE || '3.7.8');
   crossbar.export('pkg_testee3', 'raise_drop_custom_udd_o',  pkg_testee_common.URI_CASE || '3.7.9');
   crossbar.export('pkg_testee3', 'raise_drop_custom_udd_a',  pkg_testee_common.URI_CASE || '3.7.10');

   crossbar.export('pkg_testee3', 'raise_echo',  pkg_testee_common.URI_CASE || '3.7.11');
   crossbar.export('pkg_testee3', 'raise_drop_echo',  pkg_testee_common.URI_CASE || '3.7.12');
END;
/
