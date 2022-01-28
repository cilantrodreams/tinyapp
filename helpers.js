const getUserByEmail = function(email, database) {
  let user = {};
  for (const data in database) {
    if (email === database[data].email) {
      user = database[data];
    }
  }
  return user;
};

module.exports = { getUserByEmail };