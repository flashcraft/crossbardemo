CREATE OR REPLACE PACKAGE BODY pkg_codechat
AS

   FUNCTION purge (p_channel VARCHAR2) RETURN NUMBER
   AS
      l_cnt    NUMBER;
      l_res    JSON := JSON();
   BEGIN
      
      SELECT COUNT(*) INTO l_cnt FROM codechat WHERE channel = p_channel;
      
      IF l_cnt > 0 THEN
         DELETE FROM codechat WHERE channel = p_channel;
         COMMIT;
   
         l_res.put('channel', p_channel);
         l_res.put('postCount', l_cnt);
         webmq.publish(BASEURI || 'onpurge', l_res);
      END IF;

      RETURN l_cnt;
   END purge;


   FUNCTION channels RETURN JSON_LIST
   AS
      l_res       SYS_REFCURSOR;
   BEGIN

      OPEN l_res FOR
         SELECT channel AS "channel",
                COUNT(*) AS "postCount",
                TO_CHAR(MAX(published), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "lastPublished"
           FROM codechat
            GROUP BY channel
            ORDER BY channel ASC;

      RETURN json_dyn.executeList(l_res);

   END channels;


   FUNCTION get (p_params JSON) RETURN JSON_LIST
   AS
      l_res       SYS_REFCURSOR;
      l_channel   codechat.channel%TYPE;
   BEGIN

      -- mandatory attribute "channel" of type "string"
      --
      IF p_params.exist('channel') THEN
         IF p_params.get('channel').is_string THEN
            l_channel := p_params.get('channel').get_string;
            IF l_channel IS NULL THEN
               webmq.raise(BASEURI || 'invalid_argument', 'Invalid value "' || l_channel || '" for parameter "channel".');
            END IF;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_params.get('channel').get_type() || '" for parameter "channel". Expected a string.');
         END IF;
      ELSE
         webmq.raise(BASEURI || 'invalid_argument', 'Missing parameter "channel".');
      END IF;

      -- perform parametrized query on chat history
      --
      OPEN l_res FOR
         SELECT id AS "id",
                TO_CHAR(published, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "published",
                nick AS "nick",
                syntax AS "syntax",
                title AS "title",
                body AS "body"
            FROM codechat
               WHERE channel = l_channel
                  ORDER BY id ASC;

      RETURN json_dyn.executeList(l_res);

   END get;


   FUNCTION post (p_post JSON) RETURN NUMBER
   IS
      l_channel         codechat.channel%TYPE;

      l_id              codechat.id%TYPE;
      l_published       codechat.published%TYPE;
      l_nick            codechat.nick%TYPE;
      l_syntax          codechat.syntax%TYPE;
      l_title           codechat.title%TYPE := NULL;
      l_body            codechat.body%TYPE := NULL;

      l_res             JSON := JSON();
   BEGIN

      -- mandatory attribute "channel" of type "string"
      --
      IF p_post.exist('channel') THEN
         IF p_post.get('channel').is_string THEN
            l_channel := p_post.get('channel').get_string;
            IF l_channel IS NULL OR NOT REGEXP_LIKE(l_channel, '^(-|[A-Za-z0-9_]){3,10}$') THEN
               webmq.raise(BASEURI || 'invalid_argument', 'Invalid value "' || l_channel || '" for object property "channel". Must match the regular expression "^(-|[A-Za-z0-9_]){3,10}$".');
            END IF;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_post.get('channel').get_type() || '" for parameter "channel". Expected a string.');
         END IF;
      ELSE
         webmq.raise(BASEURI || 'invalid_argument', 'Missing parameter "channel".');
      END IF;

      -- mandatory attribute "nick" of type "string"
      --
      IF p_post.exist('nick') THEN
         IF p_post.get('nick').is_string THEN
            l_nick := p_post.get('nick').get_string;
            IF l_nick IS NULL OR NOT REGEXP_LIKE(l_nick, '^[A-Za-z0-9]{3,10}$') THEN
               webmq.raise(BASEURI || 'invalid_argument', 'Invalid value "' || l_nick || '" for object property "nick". Must match the regular expression "^[A-Za-z0-9]{3,10}$".');
            END IF;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_post.get('nick').get_type() || '" for object property "nick". Expected a string.');
         END IF;
      ELSE
         webmq.raise(BASEURI || 'invalid_argument', 'Missing object property "nick".');
      END IF;

      -- mandatory attribute "syntax" of type "string"
      --
      IF p_post.exist('syntax') THEN
         IF p_post.get('syntax').is_string THEN
            l_syntax := p_post.get('syntax').get_string;
            IF l_syntax IS NULL OR l_syntax NOT IN ('js', 'jswebmq', 'plsql', 'tsql', 'python', 'text') THEN
               webmq.raise(BASEURI || 'invalid_argument', 'Invalid value "' || l_syntax || '" for object property "syntax". Must be one of: js, plsql, tsql, python, text');
            END IF;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_post.get('syntax').get_type() || '" for object property "syntax". Expected a string.');
         END IF;
      ELSE
         webmq.raise(BASEURI || 'invalid_argument', 'Missing object property "syntax".');
      END IF;

      -- optional attribute "title" of type "string"
      --
      IF p_post.exist('title') THEN
         IF p_post.get('title').is_string THEN
            l_title := p_post.get('title').get_string;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_post.get('title').get_type() || '" for object property "title". Expected a string.');
         END IF;
      END IF;

      -- optional attribute "body" of type "string"
      --
      IF p_post.exist('body') THEN
         IF p_post.get('body').is_string THEN
            l_body := p_post.get('body').get_string;
         ELSE
            webmq.raise(BASEURI || 'invalid_argument', 'Invalid type "' || p_post.get('body').get_type() || '" for object property "body". Expected a string.');
         END IF;
      END IF;

      -- post ID / published
      --
      SELECT
         NVL(MAX(id) + 1, 1),
         systimestamp at time zone 'utc'
            INTO l_id, l_published
               FROM codechat WHERE channel = l_channel;

      INSERT INTO codechat (channel, id, published, nick, syntax, title, body)
         VALUES (l_channel, l_id, l_published, l_nick, l_syntax, l_title, l_body);
      COMMIT;

      -- provide sanitized object attributes in RPC result and event
      --
      l_res.put('channel', l_channel);
      l_res.put('id', l_id);
      l_res.put('published', TO_CHAR(l_published, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
      l_res.put('nick', l_nick);
      l_res.put('syntax', l_syntax);
      l_res.put('title', l_title);
      l_res.put('body', l_body);

      webmq.publish(BASEURI || 'onpost', l_res);

      RETURN l_id;

   END post;

END;
/
