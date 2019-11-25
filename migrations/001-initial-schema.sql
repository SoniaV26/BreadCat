-- Up
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email STRING,
    userAddress STRING,
    phoneNumber STRING,
    name STRING,
    password STRING
);

CREATE TABLE eat (
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
    restId INTEGER,
    message STRING,
    rating INTEGER,
    FOREIGN KEY (authorId) REFERENCES users(id),
    FOREIGN KEY (restId) REFERENCES restaurant(id)
);

CREATE TABLE authTokens
(
    token STRING PRIMARY KEY,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE restaurant (
    id INTEGER PRIMARY KEY,
    name STRING,
    address STRING,
    description STRING,
    priceRange STRING,
    yelpRating INTEGER,
    reviews INTEGER,
    delivery BOOLEAN
);

CREATE TABLE cuisine (
    id INTEGER PRIMARY KEY,
    restId INTEGER,
    breakfast BOOLEAN,
    bbq BOOLEAN,
    fastfood BOOLEAN,
    burger BOOLEAN,
    health BOOLEAN,
    pizza BOOLEAN,
    asian BOOLEAN,
    sandwich BOOLEAN,
    medit BOOLEAN,
    mex BOOLEAN,
    desert BOOLEAN,
    other BOOLEAN,
    FOREIGN KEY (restId) REFERENCES restaurant(id)
);

CREATE TABLE rest_diet (
    id INTEGER PRIMARY KEY,
    restId INTEGER,
    restriction STRING,
    substitution BOOLEAN,
    accomodate STRING,
    FOREIGN KEY (restId) REFERENCES restaurant(id)
);

-- Down
DROP TABLE users;
DROP TABLE eat;
DROP TABLE messages;
DROP TABLE authTokens;
DROP TABLE restaurant;
DROP TABLE rest_diet;