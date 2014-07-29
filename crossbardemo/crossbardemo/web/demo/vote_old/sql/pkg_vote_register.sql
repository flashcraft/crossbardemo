BEGIN
   --
   -- Crossbar.io needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_vote TO ' || crossbar.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with Crossbar.io
   --
   crossbar.remove_exports('pkg_vote');
   crossbar.export('pkg_vote', 'vote',  pkg_vote.BASEURI || 'vote');
   crossbar.export('pkg_vote', 'get',   pkg_vote.BASEURI || 'get');
   crossbar.export('pkg_vote', 'reset', pkg_vote.BASEURI || 'reset');
END;
/
