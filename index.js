const express = require("express");
const exphbs = require("express-handlebars");
const sqlite = require("sqlite");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");
const app = express();

const saltRounds = 10;

const dbPromise = sqlite.open("./data.sqlite");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded());
app.use(cookieParser());

const authorize = async (req, res, next) => {
    const db = await dbPromise;
  const token = req.cookies.authToken;
  console.log("token from authorize:", token);
  if (!token) {
    return next();
  }

  const authToken = await db.get(
    "SELECT * FROM authTokens WHERE token=?",
    token
  );
  console.log("authToken from authorize", authToken);
  if (!authToken) {
    return next();
  }

  const disor = await db.get(
    "SELECT * FROM eat WHERE id=?",
    authToken.userId
  );    

  const user = await db.get(
    "SELECT name, id FROM users WHERE id=?",
    authToken.userId
  );
  console.log("user from authorize", user);
  console.log("disor from authorize", disor);

  req.user = user;
  next();
};

app.use(authorize);

app.get("/", async (req, res) => {
    const db = await dbPromise;
    const messages = await db.all("SELECT * FROM messages");
    res.render("index", { messages: messages, user: req.user });
});
/*
const getTimer = (time, value) => 
    new Promise((resolve) =>{
        setTimeout(() => resolve(value), time);
});*/


app.post("/message", async (req, res) => {
	const db = await dbPromise;
    if(!req.user) {
    	return res.render("index", { error: "not logged in"});
    }
    if(!req.body || !req.body.message) {
    	return res.render("index", { error: "message not provided" });
    }
    await db.run("INSERT INTO messages (message, authorId) VALUES (?, ?)", req.body.message, req.user.id);
    res.redirect("/");
});

app.get("/login", (req, res) =>{
    res.render("login");
});

app.post("/login", async (req, res) =>{
    const db = await dbPromise;
    const { email, password } = req.body;
    //const email = req.body.email;
    //const password = req.body.password;

    const user = await db.get("SELECT * FROM users WHERE email=?", email);
    if(!user){
        return res.render("login", {error: "user not found"});
    }

    const matches = await bcrypt.compare(password, user.password);
    if(!matches){
        return res.render("login", { error: "password is incorrect"});
    }
    const token = uuidv4();
    await db.run("INSERT INTO authTokens (token, userId) VALUES (?, ?)",
        token,
        user.id
    );
    res.cookie("authToken", token);
    res.redirect("/");
});

app.get("/register", (req,res) =>{
    res.render("register");
});

app.post("/register", async (req, res) =>{
    const db = await dbPromise;
    const { name, email, password, gf, vn, veg, kos, na, oth } = req.body;
    let error = null;
    if(!name){
        error="name is required";
    }
    if(!email){
        error="email is required";
    }
    if(!password){
        error="password is required";
    }
    if(error){
        return res.render("register", { error: error });
    }

    const existingUser = await db.get(
        "SELECT email FROM users WHERE email=?",
        email
    );

    if(existingUser){
        return res.render("register", { error: "user already exists" });
    }

    const pwHash = await bcrypt.hash(password, saltRounds);
    await db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?);",
        name,
        email,
        pwHash
    );
    const user = await db.get("SELECT * FROM users WHERE email=?", email);
    const token = uuidv4();
    await db.run(
    "INSERT INTO authTokens (token, userId) VALUES (?, ?)",
    	token, 
        user.id
        );
        
    await db.run(
    "INSERT INTO eat (userId, gf, vegan, vegetn, kosh, na, other) VALUES (?, ?, ?, ?, ?, ?, ?)",
        user.id,
        gf === 'on',
        vn ==='on',
        veg === 'on', 
        kos === 'on',
        na === 'on',
        oth === 'on'
    );
    res.cookie("authToken", token);
    res.redirect("/");
});

app.get("/comment", async (req, res) =>{
    const db = await dbPromise;
    const messages = await db.all("SELECT * FROM messages WHERE authorId=?", req.user.id);
    res.render("comment", {user: req.user, messages: messages});
});

app.post("/comment", async (req, res) =>{
    const db = await dbPromise;
    const review = req.body.review;
    const error = null;
    if(!review)
    {
        error = "Please Enter a Review Before Submitting"
    }

    if(error)
    {
        return res.render("comment", { error: error });
    }

    await db.run("INSERT INTO messages (authorId, message) VALUES (?, ?)",
        req.user.id, 
        review
    );
    res.redirect("comment");
});

app.get("/account", async (req, res) =>{
    const db = await dbPromise;
    var gluten;
    var vegan;
    var vegetn;
    var kosh;
    var na;
    var other;
    const cur = await db.get("SELECT * FROM users WHERE id=?", req.user.id);
    const messages = await db.all("SELECT * FROM messages WHERE authorId=?", req.user.id);
    console.log(messages)
    const rest = await db.get("SELECT * FROM eat WHERE userId=?", req.user.id);
    if(rest.gf === 1){
        gluten = "Gluten-Free";
    }
    if(rest.vegan === 1){
        vegan = "Vegan";
    }
    if(rest.vegetn === 1){
        vegetn = "Vegetarian";
    }
    if(rest.kosh === 1){
        kosh = "Kosher";
    }
    if(rest.na === 1){
        na = "None"
    }
    if(rest.other === 1){
        other = "Other"
    }
    res.render("account", { 
        name: cur.name, 
        email: cur.email, 
        gf: gluten, 
        vegan: vegan, 
        vegetn: vegetn,
        kosh: kosh,
        na: na,
        other: other,
        messages: messages, 
        user: req.user });
});

app.post("/account", async (req, res) =>{

});

const setup = async () =>{
    const db = await dbPromise;
    
    db.migrate({ force: "last" })
    app.listen(1010, () => console.log("listening on http://localhost:1010"));
};

setup();