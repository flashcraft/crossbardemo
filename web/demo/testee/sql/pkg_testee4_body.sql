CREATE OR REPLACE PACKAGE BODY pkg_testee4
AS

   FUNCTION initiate_dispatch (topic VARCHAR2, event JSON_VALUE, options JSON) RETURN NUMBER
   IS
      l_exclude   webmq_sessionids := webmq_sessionids();
      l_eligible  webmq_sessionids := NULL;
      l_ids       JSON_LIST;
      l_event_id  NUMBER;
   BEGIN

      -- the standard test suite WAMP testee only registers these URIs for pubsub:
      IF topic = 'http://example.com/foobar' OR SUBSTR(topic, 1, 25) = 'http://example.com/simple' THEN

         -- 'exlucde' always takes precedence over 'excludeMe'
         IF options.exist('exclude') AND
            NOT options.get('exclude').is_null AND
            options.get('exclude').get_type = 'array' THEN

            l_ids := json_list(options.get('exclude'));
            FOR i IN 1..l_ids.COUNT
            LOOP
               l_exclude.extend();
               l_exclude(i) := l_ids.get(i).get_string;
            END LOOP;

         ELSE

            -- simulate the WAMPv1 behavior (publisher is excluded by default)
            IF options.exist('excludeMe') AND
               NOT options.get('excludeMe').is_null AND
               NOT options.get('excludeMe').get_bool THEN
               NULL;
            ELSE
               l_exclude.extend();
               l_exclude(1) := options.get('me').get_string;
            END IF;

         END IF;

         IF options.exist('eligible') AND
            NOT options.get('eligible').is_null AND
            options.get('eligible').get_type = 'array' THEN

            l_eligible := webmq_sessionids();

            l_ids := json_list(options.get('eligible'));
            FOR i IN 1..l_ids.COUNT
            LOOP
               l_eligible.extend();
               l_eligible(i) := l_ids.get(i).get_string;
            END LOOP;

         END IF;

         l_event_id := webmq.publish(topic, event, p_exclude => l_exclude, p_eligible => l_eligible);

      END IF;

      RETURN l_event_id;

   END initiate_dispatch;

END;
/
