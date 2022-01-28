const getUserByEmail = function(email, users) {
  let user = undefined;
  for (const data in users) {
    if (email === users[data].email) {
      user = users[data];
    }
  }
  return user;
};

module.exports = { getUserByEmail };