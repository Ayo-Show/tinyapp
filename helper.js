//Function to generate random string
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
};


//Function to check email
function getUserByEmail(email, database) {
  for(const userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    } 
  }
  return false;
};

function urlsForUser(id, database) {
  const userUrls = {};
  for (const url in database) {
    if (database[url].userID === id) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser }