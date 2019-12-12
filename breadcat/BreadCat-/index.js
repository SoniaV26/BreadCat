const express = require("express");
const exphbs = require("express-handlebars");
const sqlite = require("sqlite");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const uuidv4 = require("uuid/v4");
const search = require("./search");
const app = express();

const saltRounds = 10;

const dbPromise = sqlite.open("./data.sqlite");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static("public"));

const authorize = async (req, res, next) => {
  const db = await dbPromise;
  const token = req.cookies.authToken;
  if (!token) {
    return next();
  }

  const authToken = await db.get(
    "SELECT * FROM authTokens WHERE token=?",
    token
  );
  console.log("Token: ", authToken);
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
  console.log("User from authorize", user);
  console.log("Disorder from authorize", disor);

  req.user = user;
  next();
};

app.use(authorize);

app.get("/", async (req, res) => {
    res.render("index", { user: req.user });
});


app.get("/login", (req, res) =>{
    res.render("login");
});

app.post("/login", async (req, res) =>{
    const db = await dbPromise;
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email=?", email);
    if(!user){
        return res.render("login", {error: "Account Does Not Exist"});
    }

    const matches = await bcrypt.compare(password, user.password);
    if(!matches){
        return res.render("login", { error: "Password is Incorrect"});
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
    const { name, email, address, phone, password, gf, vn, veg, kos, na, oth } = req.body;
    let error = null;
    if(!name){
        error="Name is Required";
    }
    else if(!email){
        error="Email is Required";
    }
    else if(!address){
        error="Address is Required";
    }
    else if(!phone){
        error="Phone Number is Required";
    }
    else if(!password){
        error="Password is Required";
    }
    else if(!gf && !vn && !veg && !kos && !na && !oth){
        error="Please check at least one Dietary Restriction";
    }
    if(error){
        return res.render("register", { error: error });
    }

    const existingUser = await db.get(
        "SELECT email FROM users WHERE email=?",
        email
    );

    if(existingUser){
        return res.render("register", { error: "This Email is already Registered" });
    }

    const pwHash = await bcrypt.hash(password, saltRounds);
    await db.run(
        "INSERT INTO users (name, email, userAddress, phoneNumber, password) VALUES (?, ?, ?, ?, ?);",
        name,
        email,
        address,
        phone,
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


app.get("/comment/*", async (req, res) =>{
    const db = await dbPromise;
    
	var restID = req.url.substr(9);
    const rest = await db.get("SELECT * FROM restaurant WHERE id=?", restID);
    res.render("comment", { user: req.user, Restaurant_Title: rest.name, restaurant: rest });
});

app.post("/comment/*", async (req, res) =>{
    const db = await dbPromise;
    const review = req.body.review;
    const rating = req.body.rate;
    var restID = req.url.substr(9);
    const rest = await db.get("SELECT * FROM restaurant WHERE id=?", restID);
    const error = null;
    if(!review)
    {
        error = "Please Enter a Review Before Submitting"
    }

    if(error)
    {
        return res.render("comment", { error: error });
    }

    await db.run("INSERT INTO messages (authorId, authorName, restId, restName, message, rating) VALUES (?, ?, ?, ?, ?, ?)",
        req.user.id, 
        req.user.name,
        rest.id,
        rest.name,
        review,
        rating
    );
    res.redirect("/");
});

app.get("/account", async (req, res) =>{
    const db = await dbPromise;
    var gluten;
    var vegan;
    var vegetn;
    var kosh;
    var na;
    var other;
    if(req.user){
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
    }
    else{
        res.render("account");
    }
    
    
    
});

app.post("/account", async (req, res) =>{

});

app.get("/search", (req,res) =>{
    res.render("search", {user: req.user});
});

app.post("/search", async (req, res) =>{
    const { searchQuery, glutenFree, vegetarian, vegan, lowCalorie, kosher } = req.body;
	
	var searchStartTime = +new Date();
    const results = await search.searchRestaurants(searchQuery, dbPromise, glutenFree, vegetarian, vegan, lowCalorie, kosher);
	var searchEndTime = +new Date();
	console.log("Search Time: " + (searchEndTime - searchStartTime) + " ms");
    if(!results || results.length<=0){
        return res.render("search", { error: "No results" });
    }
    res.cookie("lastResults", results);
    res.redirect("/results");
});

app.get("/results", (req,res) =>{
    res.render("results", {
        results: req.cookies["lastResults"],
        user: req.user});
});


app.get("/restaurant/*", async (req,res) =>{
    const db = await dbPromise;
	var restrictionNames = ["Gluten-Free", "Vegetarian",
							"Vegan","Low Calories/Sugar",
							"Kosher"];
	
	var restID = req.url.substr(12);
    const rest = await db.get("SELECT * FROM restaurant WHERE id=?", restID);
    const messages = await db.all("SELECT * FROM messages WHERE restId=?", restID);

    var breakfast = "";
    var bbq = "";
    var fastfood = "";
    var burger = "";
    var health = "";
    var pizza = "";
    var asian = "";
    var sandwich = "";
    var medit = "";
    var mex = "";
    var desert = "";
    var other = "";

    const cuisine = await db.get("SELECT * FROM cuisine WHERE restId=?", restID);

    if(cuisine.breakfast === 1){
        breakfast = "Breakfast";
    }
    if(cuisine.bbq === 1){
        bbq = "BBQ";
    }
    if(cuisine.fastfood === 1){
        fastfood = "Fast-Food";
    }
    if(cuisine.burger === 1){
        burger = "Burgers and Fries"
    }
    if(cuisine.health === 1){
        health = "Health-Orriented";
    }
    if(cuisine.pizza === 1){
        pizza = "Pizza";
    }
    if(cuisine.asian === 1){
        asian = "Asian Food";
    }
    if(cuisine.sandwich === 1){
        sandwich = "Sandwiches";
    }
    if(cuisine.medit === 1){
        medit = "Mediterranean";
    }
    if(cuisine.mex === 1){
        mex = "Mexican";
    }
    if(cuisine.desert === 1){
        desert = "Desert";
    }
    if(cuisine.other === 1){
        other = "Other";
    }

    var averageRating = 0;
    var sumRating = 0;
    var count = 0;
    const rating = await db.each("SELECT * FROM messages WHERE restId=?", restID, (err, messageRow) => {
        sumRating += messageRow.rating;
        count++;
    });
    averageRating = 1.0 * sumRating/count;
    /*
    for(var i = 0; i < averageRating; i++){
        document.getElementById("rating").write += "<span class='fa fa-star checked'></span>";
    }
    for(var j = 0; j < 5-averageRating; j++){
        document.getElementById("rating").write += "<span class='fa fa-star'></span>";
    }*/
    var avg = averageRating.toFixed(2);
	var index = 0;
	
    var glutenFree;
    var glutPercent;
    var glutSub = "Does Not Provide Substitutions";
    var vegetarian;
    var vegePercent;
    var vegeSub = "Does Not Provide Substitutions";
    var vegan;
    var vegaPercent;
    var vegaSub = "Does Not Provide Substitutions";
    var lowCalorie;
    var lowCalPercent;
    var lowCalSub = "Does Not Provide Substitutions";
    var kosher;
    var koshPercent = "";
    var koshSub = "Does Not Provide Substitutions";
	var none = "No notable accommodations for dietary restrictions.";
	await db.each("SELECT * FROM rest_diet WHERE restId=?", restID, (err, restrictionRow) => {
		switch (restrictionRow.restriction) {
			case restrictionNames[0]:
                glutenFree = "Accommodates Gluten-Free.";
                glutPercent =  restrictionRow.accomodate + " is Accomodating";
                if(restrictionRow.substitution == 1){
                    glutSub = "Provides Gluten-Free Substitutions";
                }
				none = "";
				break;
			case restrictionNames[1]:
                vegetarian = "Accommodates Vegetarian.";
                vegePercent =  restrictionRow.accomodate + " is Accomodating";
                if(restrictionRow.substitution == 1){
                    vegeSub = "Provides Vegetarian Substitutions";
                }
				none = "";
				break;
			case restrictionNames[2]:
                vegan = "Accommodates Vegan.";
                vegaPercent =  restrictionRow.accomodate + " is Accomodating";
                if(restrictionRow.substitution == 1){
                    vegaSub = "Provides Vegan Substitutions";
                }
				none = "";
				break;
			case restrictionNames[3]:
                lowCalorie = "Accommodates Low Calorie/Sugar.";
                lowCalPercent =  restrictionRow.accomodate + " is Accomodating";
                if(restrictionRow.substitution == 1){
                    lowCalSub = "Provides Low Calorie/Sugar Substitutions";
                }
				none = "";
				break;
			case restrictionNames[4]:
                kosher = "Accommodates Kosher.";
                koshPercent =  restrictionRow.accomodate + " is Accomodating";
                if(restrictionRow.substitution == 1){
                    koshSub = "Provides Kosher Substitutions";
                }
				none = "";
				break;
		}
    });
    var delivery = "Does Not Provide Delivery";
    if(rest.delivery == 1){
        delivery = "Provides Delivery";
    }

    var priceRange = "Price Range: " + rest.priceRange;

    
    //res.cookie("curRestaurant", rest);
    res.render("restaurant", {
        restaurantID: restID,
		restaurantName: rest.name,
        restaurantDesc: rest.description,
        breakfast: breakfast,
        bbq: bbq,
        fastfood: fastfood,
        burger: burger,
        health: health,
        pizza: pizza,
        asian: asian,
        sandwich: sandwich,
        medit: medit,
        mex: mex,
        desert: desert,
        other: other,
        restaurantLink: rest.maplink,
        restaurantImg: rest.image,
        restaurantAdd: rest.address,
        glutenFree: glutenFree,
        glutenPercent: glutPercent,
        glutenSub: glutSub,
        vegetarian: vegetarian,
        vegetarianPercent: vegePercent,
        vegetarianSub: vegeSub,
        vegan: vegan,
        veganPercent: vegaPercent,
        veganSub: vegaSub,
        lowCalorie: lowCalorie,
        lowCalPercent: lowCalPercent,
        lowCalSub: lowCalSub,
        kosher: kosher,
        kosherPercent: koshPercent,
        kosherSub: koshSub,
        none: none, 
        restaurantDelivery: delivery,
        restaurantPrice: priceRange,
        messages: messages,
        averageRating: avg,
        totalRatings: count,
        user: req.user });
});

app.post("/restaurant/*", async (req, res) =>{
    var restID = req.url.substr(12);

    res.redirect("/comment/"+restID);
});

app.get("/logout", async (req,res) => {
    const db = await dbPromise;
    token = req.cookies["authToken"];
	
    await db.run("DELETE FROM authTokens WHERE token=?",
        token
    );
	res.clearCookie("authToken");
    res.redirect("/");
});


const setup = async (req, res) =>{
    const db = await dbPromise;
    
    db.migrate({ force: "last" });
    //res.clearCookie("key");
    //token = req.cookies["authToken"];
    //await db.run("DELETE FROM authTokens WHERE token=?", token);
    //res.clearCookie("authToken");
    /*
    await db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY,
        authorId INTEGER,
        authorName STRING,
        restId INTEGER,
        restName STRING,
        message STRING,
        rating INTEGER,
        FOREIGN KEY (authorId) REFERENCES users(id),
        FOREIGN KEY (restId) REFERENCES restaurant(id)
    );`);
    await db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email STRING,
        userAddress STRING,
        phoneNumber STRING,
        name STRING,
        password STRING
    )`);
    await db.run(`CREATE TABLE IF NOT EXISTS eat (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        gf BOOLEAN,
        vegan BOOLEAN,
        vegetn BOOLEAN,
        kosh BOOLEAN,
        na BOOLEAN,
        other BOOLEAN,
        FOREIGN KEY (userId) REFERENCES users(id)
     )`);
     await db.run(`CREATE TABLE IF NOT EXISTS authTokens
     (
         token STRING PRIMARY KEY,
         userId INTEGER,
         FOREIGN KEY (userId) REFERENCES users(id)
     )`);*/
    app.listen(1010, () => console.log("listening on http://localhost:1010"));
};

setup();
