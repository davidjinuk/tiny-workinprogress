const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');

let urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(function(req, res, next){
  res.locals.username = req.cookies.username;
  res.locals.urls = urlDatabase;
  res.locals.user_id = req.cookies.user_id;
  res.locals.users = users;
  next();
});

let users = {};

// Root route
// HTTP request being handled
app.get('/', (req, res) => {
  res.render('urls_index');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// app.get('/hello', (req, res) => {
//   res.end('<html><body>Hello <b>World</b></body></html>\n');
// });

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies['username']
  }
  res.render("urls_new", templateVars);
});

// Should be /urls NOT /urls/create
app.post('/urls/create', (req, res) => {
  let shortURL = randomString();
  //ID OR NAME from URLS_NEW
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  //already on urls/.   only need shortURL
  res.redirect(shortURL);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (let user in users) {
    if ((email === users[user].email) && (password === users[user].password)) {
      res.cookie('user_id', users[user].id)
      return res.redirect('/');
    }
  }
  res.sendStatus(403);
});

app.get('/login', (req, res) => {
  res.render('urls_login');
});

app.post('/logout', (req, res) => {
  res.cookie('user_id', '');
  res.redirect('/');
});

app.post('/register', (req, res) => {
  let id = randomString();
  let email = req.body.email;
  let password = req.body.password;
  var badUser = false;

  // put it in global!
  for (let user in users) {
    if (email === users[user].email) {
      badUser = true;
      res.sendStatus(400);
    }
    if (email === '' || password === '') {
      badUser = true;
      res.sendStatus(400);
    }
  }

  if (!badUser) {
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    res.cookie('user_id', id);
    res.redirect('/');
  }

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function randomString() {
    let result = '';
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * 62)];
    }
    return result;
}