const express = require("express");
const cookieparser = require("cookie-parser")
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



/// POST TO URLS

app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  const { longURL } = req.body;
  if (!longURL) {
    return res.status(400).send('Please enter a valid longURL');
  }

  const id = generateRandomString();
  urlDatabase[id] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

// Get Registration page

app.get("/register", (req, res)=> { 
  const id = req.params.id
  const longURL = urlDatabase[req.params.id]
  const username = req.cookies.username
  
  const templateVars = { id, longURL, username };
  res.render("reg_new", templateVars);

})

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

  res.clearCookie('username')
  res.redirect('/urls')
})

//POST ADD NEW URL
app.post("/urls/:id", (req, res) => {
  
  urlDatabase[req.params.id] = req.body.updatedURL;
  console.log(req.params);
  console.log(req.body);
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
  const username = req.cookies.username
  const templateVars = {  username }
  res.render("urls_new",templateVars);
});

// GET EXISTING URLS PAGE

app.get("/urls", (req, res) => {
  const username = req.cookies.username
  const templateVars = { urls: urlDatabase , username};
  console.log(username)
  res.render("urls_index", templateVars);
});

// GET SHORT CODE DETAILS PAGE

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[req.params.id]
  const username = req.cookies.username
  
  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});