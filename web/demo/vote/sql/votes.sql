CREATE TABLE votes
(
   subject     VARCHAR2(100)     NOT NULL,
   votes       NUMBER(10)        NOT NULL,
   PRIMARY KEY (subject)
)
/

BEGIN
   INSERT INTO votes (subject, votes) VALUES ('Banana', 0);
   INSERT INTO votes (subject, votes) VALUES ('Lemon', 0);
   INSERT INTO votes (subject, votes) VALUES ('Chocolate', 0);
   COMMIT;
END;
/
