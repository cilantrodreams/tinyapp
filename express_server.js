const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');

// Middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Data stores

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// Helper function for generating random 6 char strings
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

//GET ROUTES

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars);
  res.end();
});

// POST ROUTES

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // create and add user
  const newUserId = generateRandomString();
  const newUser = { id: newUserId };
  Object.assign(newUser, req.body);
  users[newUserId] = newUser;

  // set cookie to newly created user
  res.cookie('user_id', newUserId);

  res.redirect('/urls');
  res.end();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});