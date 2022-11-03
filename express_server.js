// ------------------Requirements
const express = require("express");
const { getUserByEmail } = require('./helpers');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

//Databases
const urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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


//---------------Setup and Middleware
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({

  name: 'session',
  keys: ['Key1', 'Key2', 'Key3'],
}));




// ------------------------- Helper functions

const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = (id) => {

  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      const match = {};
      match[urlId] = urlDatabase[urlId].longURL;

      return match;
    }
  }

};


// ------------------------ Routes and endpoints

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// CRUD Operations
//Create - Post

// Registration validation and recording
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {

    return res.status(400).send('Username/Password cannot be empty');
  }

  if (getUserByEmail(email, users)) {

    return res.status(400).send('This email is already registered');
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id, email, password: hashedPassword };

  req.session.user_id = id;
  res.redirect('/urls');
});

// Delete request validation

app.post("/urls/:id/delete", (req, res) => {

  const id = req.params.id;
  const cookieUserID = req.session["user_id"];
  const urlObj = urlDatabase[id];

  if (!cookieUserID) {

    return res.send('You must login to delete this URL');
  }
  if (!urlObj) {

    return res.send('This id does not match any short URLs');
  }
  if (cookieUserID !== urlObj.userID) {

    res.send('You do not own this URL so you may not access it');
  }

  delete urlDatabase[id];

  res.redirect('/urls');
});


// Login validation

app.post('/login', (req, res) => {


  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {

    return res.status(403).send('Cannot find this user account');
  }

  if (!bcrypt.compareSync(password, user.password)) {

    return res.status(403).send('Incorrect Password Entered');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logout Validation

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect('/login');
});

app.get("/login", (req, res) => {


  if (req.session["user_id"]) {

    res.redirect('/urls');

  } else {

    const templateVars = { user: null };
    res.render("login", templateVars);
  }
});

/// Logged in Validation + Adding new URLS

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const { updatedURL } = req.body;

  if (!req.session["user_id"]) {

    return res.send('Please log in to shorten URLs');
  }
  if (!updatedURL) {

    return res.status(400).send('Please enter a valid longURL');
  }

  const id = generateRandomString();
  urlDatabase[id] = { longURL: updatedURL, userID: userId };

  res.redirect(`/urls/${id}`);
});

// Validating that the user is logged in, that the short url id exists and that the logged in user is the owner

app.post("/urls/:id", (req, res) => {


  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  const cookieUserID = req.session["user_id"];
  const user_id = urlDatabase[req.params.id].userID;
  const user = users[cookieUserID];
  const templateVars = { id, longURL, user };

  if (!user_id) {

    return res.send('You must login to edit this URL');
  }
  if (!id) {

    return res.send('This Id doesnt exist');
  }

  if (cookieUserID !== user_id) {

    res.send('You do not own this URL so you may not access it');
  }
  res.redirect('/urls');
});

// ---------------- Read (GET)


//Get the registration page
app.get("/register", (req, res) => {
  const email = req.body.email;
  const id = req.params.id;

  const templateVars = { id, user: null };
  const user = getUserByEmail(email, users);

  if (req.session["user_id"]) {

    res.redirect('/urls');

  } else {

    res.render("reg_new", templateVars);
  }
});

// Get the short ID

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!req.session["user_id"]) {

    return res.send('Login to access this page');
  }
  if (longURL === undefined) {

    return res.send('This website doesnt exist');

  } else {

    res.redirect(longURL);
  }
});

// GET NEW URLS PAGE

app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];

  const templateVars = {
    user,
    urls: urlsForUser(userId)
  };

  if (!req.session["user_id"]) {

    res.redirect('/login');

  } else {

    res.render("urls_new", templateVars);
  }
});

// GET EXISTING URLS PAGE

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
  console.log("/urls user id", userId);

  if (!userId) {

    res.send('Error Please login to view URLs');
    return;
  }

  const user = users[userId];
  const templateVars = {
    user,
    urls: urlsForUser(userId)
  };

  res.render('urls_index', templateVars);
});

// GET SHORT CODE DETAILS PAGE

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  const cookieUserID = req.session["user_id"];
  const user_id = urlDatabase[req.params.id].userID;
  const user = users[cookieUserID];
  const templateVars = { id, longURL, user };

  if (!user) {

    res.send('Please log in to view URLS');
  }

  if (cookieUserID !== user_id) {

    res.send('You do not own this URL so you may not access it');
  }

  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

