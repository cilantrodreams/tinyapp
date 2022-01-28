const generateUserHelpers = (users, urlDatabase) => {

  const getUserByEmail = function(email) {
    let user = undefined;
    for (const data in users) {
      if (email === users[data].email) {
        user = users[data];
      }
    }
    return user;
  };

  const generateRandomString = function() {
    return Math.random().toString(36).slice(2, 8);
  };

  const urlsForUser = function(id) {
    const userURLS = {};
    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === id) {
        userURLS[url] = urlDatabase[url];
      }
    }
    return userURLS;
  };

  return { getUserByEmail, generateRandomString, urlsForUser };
};

module.exports = generateUserHelpers;