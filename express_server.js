const express = require("express");
const cookieparser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
// Config ^
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

/// POST TO URLS

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send('Please enter a valid longURL');
  }

  const id = generateRandomString();
  urlDatabase[id] = longURL;

  res.redirect(`/urls/${id}`);
});


// POST Registration handler
app.post("/register", (req, res) => {
  const id = generateRandomString();
  email = req.body.email;
  password = req.body.password;
  
users[id] = { id, email, password };
 
  res.cookie("user_id", id)
  res.redirect('/urls');

});


// Get Registration page

app.get("/register", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  // const username = req.cookies.user_id;

  const templateVars = { id, longURL, user:null };
  res.render("reg_new", templateVars);
  
});

// GET ID 

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log("Console log of params id", req.params.id);
  res.redirect(longURL);
});

// POST DELETE REQUEST

app.post("/urls/:id/delete", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  delete urlDatabase[req.params.id];
  delete urlDatabase[longURL];
  res.redirect('/urls');
});


// POST LOGIN NAME

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

// POST CLEAR USERNAME

app.post('/logout', (req, res) => {

  res.clearCookie('username');
  res.redirect('/urls');
});

//POST ADD NEW URL
app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.updatedURL;

  res.redirect('/urls');
});


app.get("/", (req, res) => {
  res.send("Hello!");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GET NEW URLS PAGE

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

// GET EXISTING URLS PAGE

app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id]
  const templateVars = { urls: urlDatabase, user };

  res.render("urls_index", templateVars);
});

// GET SHORT CODE DETAILS PAGE

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  const username = req.cookies.username;

  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});