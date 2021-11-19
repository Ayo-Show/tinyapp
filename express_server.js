const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const generateRandomString = require('./helper');

app.use(bodyParser.urlencoded({extended: true}));

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

const urlsForUser = id => {
  let userUrls = {};
  for (let url in urlDatabase) {

    if (urlDatabase[url]['userID'] === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};


app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  console.log(urlDatabase)
  const longURL = urlDatabase[req.params.shortURL].longURL
 
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  
  if (req.session.user_id) {
    const username = users[req.session.user_id];
    let userUrls = urlsForUser(req.session.user_id);
    
    const templateVars = { urls: userUrls, username: username };
    
    res.render("urls_index", templateVars);
  } else {

    res.send("<html><body>Please log in or Register first</body></html>\n");
  }
  
  

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
  
  let tempUser = "";
  for (let key in users) {
	  if (users[key]['email'] === email) {
  	
    tempUser = users[key];
    }
  };
  
  if (!tempUser) {
    return res.status(403).send("Cannot find user.");

  }
  console.log(users);
 
  if (!email || !password) {
    return res.status(403).send("An email or password needs to be entered.");
    
  }
  
  if (!bcrypt.compareSync(password, tempUser.password)) {
    return res.status(403).send("Password is wrong.");
  }
  
  req.session.user_id = tempUser.id;
  res.redirect("/urls");
});
  
  
  
  
  
  
  


app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {username: users[user] }
   res.render("urls_login", templateVars);

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//registration page
app.get("/register", (req, res) => {
  const username = req.session.user_id;
  const templateVars = { urls: urlDatabase, username: users[username] };
  console.log(templateVars);
  res.render("urls_register", templateVars);

});

//Function to check email
const checkEmail = (email) => {
  for(let userid in users) {
    if (users[userid]['email'] === email) {
      return true;
    } 
  }
  return false;
};


//Registering New Users
app.post("/register", (req,res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("An email or password needs to be entered.");
    
  };
  if (checkEmail(email)) {
    return res.status(400).send("email or password has already been used.");
  }
  console.log(users)
  let userID = generateRandomString();
  const newUser = {
    id: userID, 
    email: req.body.email, 
    password: bcrypt.hashSync(password, 10)

  };
  users[userID] = newUser;
  console.log(users);
  req.session.user_id = userID;
  // res.cookie("user_id", userID);
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
