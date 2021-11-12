const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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
}

const urlsForUser = id => {
  let userUrls = {};
  for (let url in urlDatabase) {

    if (urlDatabase[url]['userID'] === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  // const username = req.cookies["username"]
  if (req.cookies["user_id"]) {
    const username = users[req.cookies["user_id"]];
    let userUrls = urlsForUser(req.cookies["user_id"]);
    console.log("***", userUrls)
    const templateVars = { urls: userUrls, username: username };
    // const templateVars = { urls: urlDatabase, username: username };
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>Please log in or Register first</body></html>\n");
  }
  
  

});

app.get("/urls/new", (req, res) => {
  const username = users[req.cookies["user_id"]]
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL
  console.log(req.params.longURL, "-----")
  const templateVars = { shortURL: req.params.shortURL, 
    
    longURL: longUrl, username: users[req.cookies["user_id"]] };
  // console.log(templateVars.username);
  res.render("urls_show", templateVars);
});


app.post("/urls", (req,res) => {
  console.log('req.body',req.body);
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = { 'longURL': req.body.longURL, 'userID': req.cookies["user_id"] } //shortURL-longURL key-value pair saved to urlDatabase
  console.log('#####', urlDatabase);
  
  res.redirect(`/urls/${shortURL}`);
});

//DELETE a single URL
app.post("/urls/:shortURL/delete", (req,res) => {
  const shortURLToDel = req.params.shortURL;
  delete urlDatabase[shortURLToDel]; // delete the property in urlDatabase obj
  res.redirect('/urls');
})




app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  let tempUser = "";
  for (let key in users) {
	  if (users[key]['email'] === email) {
  	
    tempUser = users[key]['id']
    }
  }
 
  if (!email || !password) {
    return res.status(403).send("An email or password needs to be entered.")
    
  };
  if (users[tempUser]['password'] !== password) {
    return res.status(403).send("Password is wrong.")
  }
  
  // Get user input 
  // const username = req.body.username
  
  res.cookie("user_id", tempUser);
  
  res.redirect("/urls");
});
  
  
  


app.get("/login", (req, res) => {
  const user = req.cookies["user_id"]
  if (user) {
    return res.redirect("/urls");
  }
   res.render("urls_login");

})


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//registration page
app.get("/register", (req, res) => {
  const username = req.cookies["username"]
  const templateVars = { urls: urlDatabase, username: username };
  console.log(templateVars);
  res.render("urls_register", templateVars);

});

//Function to check email
const checkEmail = (email) => {
  for(userid in users) {
    if (users[userid]['email'] === email) {
      return true;
    } 
  }
  return false;
}


//Registering New Users
app.post("/register", (req,res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("An email or password needs to be entered.")
    
  };
  if (checkEmail(email)) {
    return res.status(400).send("email or password has already been used.")
  }
  console.log(users)
  let userID = generateRandomString();
  const newUser = {
    id: userID, 
    email: req.body.email, 
    password: bcrypt.hashSync(password, 10)

  }
  users[userID] = newUser;
  // req.session.userID = userID;
  console.log(users)
  res.cookie("user_id", userID);
  res.redirect("/urls");

});



  
  





function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
};

generateRandomString();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
