const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helper');


app.use(express.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "user@example.com"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};





app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;

  const urlObj = urlDatabase[shortURL];
  if (!urlObj) {
    return res.status(404).send("You need to provide a valid shortURL or the URL doesn't exist");
  }

  return res.redirect("http://" + urlObj.longURL);
});


app.get("/urls", (req, res) => {
  
  const { user_id } = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }

  const user = users[user_id];
  if (!user) {
    return res.status(400).send("User isn't valid or doesn't exist");
  }

  const userUrls = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userUrls, username: user };
  return res.render("urls_index", templateVars);
});
  


app.get("/urls/new", (req, res) => {
  const username = users[req.session.user_id];
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send("Cannot find URL.")
  }
  const longUrl = urlDatabase[req.params.shortURL].longURL
  
  const templateVars = { shortURL: req.params.shortURL, 
    
    longURL: longUrl, username: users[req.session.user_id] };
  
  res.render("urls_show", templateVars);
});


app.post("/urls", (req,res) => {
  console.log('req.body',req.body);
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { 'longURL': req.body.longURL, 'userID': req.session.user_id } 
  res.redirect(`/urls/${shortURL}`);
});



 
  

// Edit URL
app.post("/urls/:shortURL/edit", (req,res) => {
  const shortURL = req.params.shortURL;
  console.log(req.body);
  urlDatabase[shortURL].longURL = req.body.longURL;

  console.log(urlDatabase);
  res.redirect('/urls');
});

//DELETE a single URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURLToDel = req.params.shortURL;
  delete urlDatabase[shortURLToDel]; // delete the property in urlDatabase obj
  res.redirect('/urls');
});




app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("An email or password needs to be entered.");
  }
    
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(400).send("Cannot find user.");
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(400).send("Password is wrong.");
  }
  
  req.session.user_id = user.id;
  console.log("login passed")
  return res.redirect("/urls");
});
  
  
  
  
  
  
  


app.get("/login", (req, res) => {
  const username = req.session.user_id;
  if (username) {
    return res.redirect("/urls");
  }

  const templateVars = { username: null };
  res.render("urls_login", templateVars);

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//registration page
app.get("/register", (req, res) => {
  const username = req.session.user_id;
  if (username) {
    return res.redirect("/urls");
  }

  const templateVars = { username: null };
  res.render("urls_register", templateVars);
});
  





//Registering New Users
app.post("/register", (req,res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("An email or password needs to be entered.");
  };
   
  const emailExists = getUserByEmail(email, users);
  if (emailExists) {
    return res.status(400).send("email has already been used.");
  }
  
  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID, 
    email: email, 
    password: hashedPassword
  };
  console.log(users);

  req.session.user_id = userID;
  console.log("register passed");
  return res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
