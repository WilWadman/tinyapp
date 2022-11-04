// ------------------Requirements
const express = require("express");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const cookieSession = require("cookie-session");
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
app.use(
  cookieSession({
    name: "session",
    keys: ["Key1", "Key2", "Key3"],
  })
);

// ------------------------ Routes and endpoints

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  return res.redirect("/login");
});

// CRUD Operations
//Create - Post

// Registration validation and recording
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Username/Password cannot be empty");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already registered");
  } else {
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[id] = { id, email, password: hashedPassword };

    req.session.user_id = id;
    return res.redirect("/urls");
  }
});

// Delete request validation

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const cookieUserID = req.session["user_id"];
  const urlObj = urlDatabase[id];

  if (!cookieUserID) {
    return res.send("You must login to delete this URL");
  }
  if (!urlObj) {
    return res.send("This id does not match any short URLs");
  }
  if (cookieUserID !== urlObj.userID) {
    res.send("You do not own this URL so you may not access it");
  } else {
    delete urlDatabase[id];

    return res.redirect("/urls");
  }
});

// Login validation

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Please enter a valid username and password");
  }

  if (!user) {
    return res.status(403).send("Cannot find this user account");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect Password Entered");
  } else {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  }
});

// Logout Validation

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

/// Logged in Validation + Adding new URLS

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const { updatedURL } = req.body;
  const id = generateRandomString();

  if (!req.session["user_id"]) {
    return res.send("Please log in to shorten URLs");
  }
  if (!updatedURL) {
    return res.status(400).send("Please enter a valid longURL");
  } else {
    urlDatabase[id] = { longURL: updatedURL, userID: userId };

    return res.redirect(`/urls/`);
  }
});

// Validating that the user is logged in, that the short url id exists and that the logged in user is the owner

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  const cookieUserID = req.session["user_id"];
  const user_id = urlDatabase[req.params.id].userID;
  const user = users[cookieUserID];
  const templateVars = { id, longURL, user };
  const { updatedURL } = req.body;

  if (!user_id) {
    return res.send("You must login to edit this URL");
  }
  if (!id) {
    return res.send("This Id doesnt exist");
  }

  if (cookieUserID !== user_id) {
    return res.send("You do not own this URL so you may not access it");
  } else {
    urlDatabase[id].longURL = updatedURL;

    return res.redirect("/urls");
  }
});

// ---------------- Read (GET)

app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    return res.render("login", templateVars);
  }
});

//Get the registration page
app.get("/register", (req, res) => {
  const email = req.body.email;
  const id = req.params.id;
  const templateVars = { id, user: null };
  const user = getUserByEmail(email, users);

  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    return res.render("reg_new", templateVars);
  }
});

// Get the short ID

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (longURL === undefined) {
    return res.send("This website doesnt exist");
  } else {
    return res.redirect(longURL);
  }
});

// GET NEW URLS PAGE

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const user = users[userId];

  const templateVars = {
    user,
    urls: urlsForUser(userId, urlDatabase),
  };

  if (!req.session["user_id"]) {
    return res.redirect("/login");
  } else {
    return res.render("urls_new", templateVars);
  }
});

// GET EXISTING URLS PAGE

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];

  if (!userId) {
    return res.send("Error Please login to view URLs");
  } else {
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = {
      user,
      urls,
    };

    return res.render("urls_index", templateVars);
  }
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
    return res.send("Please log in to view URLS");
  }
  if (!longURL) {
    return res.send("There is no longURL for this ID");
  }

  if (cookieUserID !== user_id) {
    return res.send("You do not own this URL so you may not access it");
  } else {
    return res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
