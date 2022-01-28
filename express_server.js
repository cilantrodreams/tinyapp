const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const generateUserHelpers = require('./helpers');
const bcrypt = require('bcryptjs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["mama, i just killed a man, put a gun against his head, pulled my trigger now he's dead"]
}));

// Data stores

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: bcrypt.hashSync("dishwasher-funk", 10),
  }
}

// Helper functions

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = generateUserHelpers(users, urlDatabase);

//GET ROUTES

app.get("/", (req, res) => {
  // redirect depending on user login status
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // check if user is logged in
  const userID = req.session.user_id;
  if (!userID) {
    return res.sendStatus(403);
  }

  //filter url database for user's urls
  const userURLs = urlsForUser(userID);

  const templateVars = {
    user: users[userID],
    urls: userURLs
  };

  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('urls_new', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // check if user is logged in
  const userID = req.session.user_id;
  if (!userID) {
    return res.sendStatus(403);
  }

  // check if correct user is logged in
  const shortURL = req.params.shortURL;
  console.log('userID:', userID)
  console.log('urlDatabase[shortURL].userID:', urlDatabase[shortURL].userID);
  if (userID !== urlDatabase[shortURL].userID) {
    return res.sendStatus(403);
  }
  const templateVars = {
    user: users[userID],
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
  res.end();
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
  res.end();
});

// POST ROUTES

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.sendStatus(403);
  }
  const newURL = {};
  const shortURL = generateRandomString();
  newURL["longURL"] = req.body.longURL;
  newURL["userID"] = req.session.user_id;
  urlDatabase[shortURL] = newURL;
  res.redirect(`/urls/${shortURL}`);

});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.sendStatus(403);
  }
  const shortURL = req.params.id;
  if (userID !== urlDatabase[shortURL].userID) {
    return res.sendStatus(403);
  }

  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.sendStatus(403);
  }
  const shortURL = req.params.id;
  console.log('userID:', userID)
  console.log('urlDatabase[shortURL].userID:', urlDatabase[shortURL].userID);
  if (userID !== urlDatabase[shortURL].userID) {
    return res.sendStatus(403);
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

app.post('/login', (req, res) => {
  let user = getUserByEmail(req.body.email);
  if (!user.id) {
    return res.sendStatus(403);
  }
  if (!bcrypt.compareSync(req.body.password, user.hashedPassword)) {
    return res.sendStatus(403);
  }
  req.session.user_id = user.id;
  res.redirect('/urls');

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.post('/register', (req, res) => {
  // check if all form inputs are valid
  if (!req.body.email || !req.body.password) {
    return res.sendStatus(400);
  }
  if (getUserByEmail(req.body.email)) {
    return res.sendStatus(400);
  }
  // create and add user
  const newUserId = generateRandomString();
  const newUser = { id: newUserId };
  newUser['email'] = req.body.email;
  newUser['hashedPassword'] = bcrypt.hashSync(req.body.password, 10);
  users[newUserId] = newUser;
  // set cookie to newly created user
  req.session.user_id = newUserId;

  res.redirect('/urls');
  res.end();

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});