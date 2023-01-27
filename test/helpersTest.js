const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser, cookieHasUser } = require('../helpers.js');

const testUsers = {
  "user1RandomID": {
    id: "user1RandomID", 
    email: "user1@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
    "b2jQot": {
      longUrl: "http://www.lighthouselabs.ca",
      userID: "user1RandomID"
    },
    "ht3am5": {
      longUrl: "http://www.google.com",
      userID: "user1RandomID"
    },
    "mJqc4t": {
      longUrl: "http://www.zara.com",
      userID: "user2RandomID"
    }
};
  
describe('getUserByEmail', function() {

    it('should return a user with a valid email', function() {
        const user = getUserByEmail("user1@example.com", testUsers).id;
        const expectedOutput = "user1RandomID";
        assert.equal(user, expectedOutput);
    });

    it('should return undefined when no user exists with the given email address', function() {
        const user = getUserByEmail("this@example.com", testUsers);
        const expectedOutput = undefined;
        assert.equal(user, expectedOutput);
    });
});

describe('generateRandomString', function() {

    it('should return a 6 characters alphanumerical string', function() {
        const randomStringLength = generateRandomString().length;
        const expectedOutput = 6;
        assert.equal(randomStringLength, expectedOutput);
    });
});

describe('urlsForUser', function() {

    it('should return URLs object specific to the given user ID', function() {
        const urls = urlsForUser("user1RandomID", testUrlDatabase);
        const expectedOutput =  {"b2jQot": {
            longUrl: "http://www.lighthouselabs.ca",
            userID: "user1RandomID"
          },
          "ht3am5": {
            longUrl: "http://www.google.com",
            userID: "user1RandomID"
          }};
        assert.deepEqual(urls, expectedOutput);
    });

    it('should return and empty object if no URLs exist for the given user ID', function() {
        const urls = urlsForUser("user3RandomID", testUrlDatabase);
        const expectedOutput =  {};
        assert.deepEqual(urls, expectedOutput);
    });
});

describe('cookieHasUser', function() {

    it('should return true if current cookie corresponds with a user in the userDatabase', function() {
        const existCookie = cookieHasUser("user1RandomID", testUsers);
        const expectedOutput = true;
        assert.deepEqual(existCookie, expectedOutput);
    });

    it('should return false if current cookie corresponds with a user in the userDatabase', function() {
        const existCookie = cookieHasUser("user3RandomID", testUsers);
        const expectedOutput = false;
        assert.deepEqual(existCookie, expectedOutput);
    });
});
