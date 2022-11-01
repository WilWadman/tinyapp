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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};





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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log("Console log of params id", req.params.id);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  delete urlDatabase[req.params.id];
  delete urlDatabase[longURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {

  res.clearCookie('username')
  res.redirect('/urls')
})


app.post("/urls/:id", (req, res) => {
  // need to access the existing id
  // then need to update the existing id with the newly inputted updatedURL
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

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username
  const templateVars = {  username }
  res.render("urls_new",templateVars);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username
  const templateVars = { urls: urlDatabase , username};
  console.log(username)
  res.render("urls_index", templateVars);
});

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