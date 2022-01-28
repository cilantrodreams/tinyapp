const { assert } = require('chai');

const generateUserHelpers = require('../helpers.js');

const testUrlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const testUsers = {
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
};

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = generateUserHelpers(testUsers, testUrlDatabase);

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined if user not found', function() {
    const user = getUserByEmail("notauser@example.com", testUsers)
    const expectedUser = undefined;
    assert.deepEqual(user, expectedUser);
  });
});

describe('generateRandomString', function() {
  it('should return a string with 6 characters', function() {
    const string = generateRandomString();
    const expectedLength = 6;
    assert.strictEqual(string.length, 6);
  });
});

describe('urlsForUser', function() {
  it('should return the urls associated with a user id', function() {
    const urls = urlsForUser("user2RandomID");
    const expectedUrls = {
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "user2RandomID"
      }
    };
    assert.deepEqual(urls, expectedUrls);
  });
  it('should return an empty object if no urls found', function() {
    const urls = urlsForUser("nonexistantID");
    const expectedUrls = {};
    assert.deepEqual(urls, expectedUrls);
  });
});