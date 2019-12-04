-- Up
CREATE TABLE users(
    id INTEGER PRIMARY KEY,
    email STRING,
    name STRING,
    password STRING
);
CREATE TABLE messages
(
    id INTEGER PRIMARY KEY,
    messages STRING
);
-- Down

DROP TABLE users;
DROP TABLE messages;
