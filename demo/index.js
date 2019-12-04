const express = require("express");
const exphbs = require("express-handlebars");
const sqlite = require("sqlite");
const bcrypt = require("bcrpyt");
const app = express();

const saltRounds = 10;
const dbPromise = sqlite.open("./data.sqlite");

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded());

app.get("/", async (req, res) => {
  const db = await dbPromise;
  const messages = await db.all("SELECT * FROM messages");
  console.log(messages);
  res.render("index", { messages: messages });
});

app.post("/messages", async (req, res) => {
  const db = await dbPromise;
  await db.run("INSERT INTO messages (message) VALUES (?)", req.body.message);
  res.redirect("/");
});

app.post("/register",async (req , res) => {
    res.render("register");
});

app.post("/register",async (req,res)=>{
const db = await dbPromise;
const{name, email, password}
});

const setup = async () => {
  const db = await dbPromise;
  await db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      message STRING
    );`);
  app.listen(3000, () => console.log("listening on http://localhost:3000"));
};

setup();


