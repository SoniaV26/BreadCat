-- Up
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email STRING,
    name STRING,
    password STRING
);

CREATE TABLE eat(
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    gf BOOLEAN,
    vegan BOOLEAN,
    vegetn BOOLEAN,
    kosh BOOLEAN,
    na BOOLEAN,
    other BOOLEAN,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE messages(
    id INTEGER PRIMARY KEY,
    authorId INTEGER,
    message STRING,
    FOREIGN KEY (authorId) REFERENCES users(id)
);

CREATE TABLE authTokens
(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Down
DROP TABLE users;
DROP TABLE eat;
DROP TABLE messages;
DROP TABLE authTokens;