const express = require("express");

const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080



const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUserByEmail = (emailReg) => {

  for (let user in users) {
    if (emailReg === users[user].email) {
      return users[user];
    }
  }
  return null;
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
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  
  name: 'session',
  keys:['Key1', 'Key2', 'Key3'],
}));
// Config ^
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

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


/// GET LOGIN

app.get("/login", (req, res) => {


  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    const templateVars = { user: null };
    res.render("login", templateVars);
  }
});

/// POST TO URLS

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"]; // Log the POST request body to the console
  const { updatedURL } = req.body;

  if (!req.session["user_id"]) {
    return res.send('Please log in to shorten URLs');
  }
  if (!updatedURL) {
    return res.status(400).send('Please enter a valid longURL');
  }
  console.log("Console log of user id in post urls", userId);
  const id = generateRandomString();
  urlDatabase[id] = { longURL: updatedURL, userID: userId };

  res.redirect(`/urls/${id}`);
});


// POST Registration handler
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  if (!email || !hashedPassword) {
    return res.status(400).send('Username/Password cannot be empty');
  }

  if (getUserByEmail(email) !== null) {
    return res.status(400).send('This email is already registered');
  }

  users[id] = { id, email, hashedPassword };
  // res.cookie("user_id", id);
  req.session.user_id = id;
  res.redirect('/urls');

});


// Get Registration page

app.get("/register", (req, res) => {
  const email = req.body.email;
  const id = req.params.id;

  const templateVars = { id, user: null };
  const user = getUserByEmail(email);
  if (req.session["user_id"]) {
    res.redirect('/urls');
  } else {
    res.render("reg_new", templateVars);
  }
});

// GET ID

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

// POST DELETE REQUEST

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


// POST LOGIN NAME

app.post('/login', (req, res) => {


  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(email);

  if (user === null) {
    return res.status(403).send('Cannot find this user account');
  }
  if (user !== null) {
   if (!bcrypt.compareSync( password , hashedPassword)){
return res.status(403).send('Incorrect Password Entered');
   } 
      if(bcrypt.compareSync( password , hashedPassword)){

      // res.cookie("user_id", user.id);
      res.session.user_id = user.id;
      res.redirect('/urls');
    }
  }
});

// POST CLEAR USERNAME

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect('/login');
});

//POST ADD NEW URL
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


app.get("/", (req, res) => {
  res.send("Hello!");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GET NEW URLS PAGE

app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  const templateVars = {
    user,
    urls: urlsForUser(userId)
  };
  console.log("Template", templateVars);
  if (!req.session["user_id"]) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);

  }
});

// GET EXISTING URLS PAGE

app.get('/urls', (req, res) => {
  const userId = req.session['user_id'];
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




  // if(req.cookies["user_id"] !== ){
  //   return res.send('This is not your short url');


});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});