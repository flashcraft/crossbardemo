CREATE TABLE codechat
(
   channel     VARCHAR2(100)     NOT NULL,
   id          NUMBER (10)       NOT NULL,
   published   TIMESTAMP         NOT NULL,
   nick        VARCHAR2(100)     NOT NULL,
   syntax      VARCHAR2(100)     NOT NULL,
   title       NVARCHAR2(2000),
   body        NVARCHAR2(2000),
   PRIMARY KEY (channel, id)
)
/
