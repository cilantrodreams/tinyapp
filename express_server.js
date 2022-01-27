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

// Helper functions

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const findEmail = function(newEmail) {
  for (const user in users) {
    if (newEmail === users[user].email) {
      return true;
    }
  }
  return false;
};

const getUserbyEmail = function(newEmail) {
  let currentUser = {};
  for (const user in users) {
    if (newEmail === users[user].email) {
      currentUser = Object.assign(users[user]);
    }
  }
  return currentUser;
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
  };
  res.render("register", templateVars);
  res.end();
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
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
  let currentUser = getUserbyEmail(req.body.email);
  if (!currentUser.id) {
    res.sendStatus(403);
  } else if (currentUser.password !== req.body.password) {
    res.sendStatus(403);
  } else {
    res.cookie("user_id", currentUser.id);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  // check if all form inputs are valid
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else if (findEmail(req.body.email)) {
    res.sendStatus(400);
  } else {
    // create and add user
    const newUserId = generateRandomString();
    const newUser = { id: newUserId };
    Object.assign(newUser, req.body);
    users[newUserId] = newUser;

    // set cookie to newly created user
    res.cookie('user_id', newUserId);

    res.redirect('/urls');
    res.end();
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});