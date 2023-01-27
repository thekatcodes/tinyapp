// const {urlDatabase} = require("./express_server")
/* Checks if given email corresponds to a user in a given database, returns true or false */
// const checkUserByEmail = function (email, users) {
// 	for (let id in users) {
// 		if (users[id].email === email) {
// 			return true;
// 		} else {
// 			return false;
// 		}
// 	}
// };
/* Takes an email and userDatabase and returns the user ID for the user with the given email address */
const getUserByEmail = function (email, users) {
	for (let id in users) {
		if (users[id].email === email) {
			return users[id];
		}
    }
};

/* Generates a random string, used for creating short URLs and userIDs */
const generateRandomString = function () {
	let randomString = "";
	let characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 6; i++) {
		randomString += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}
	return randomString;
};

/* Returns URLs where the userId is equal to the id of the currently logged-in user */
const urlsForUser = function (id, urlDatabase) {
	const userUrls = {};
	for (const shortURL in urlDatabase) {
		if (urlDatabase[shortURL].userID === id) {
			userUrls[shortURL] = urlDatabase[shortURL];
		}
	}
	return userUrls;
};

/* Checks if current cookie corresponds with a user in the userDatabase */
const cookieHasUser = function (cookie, userDatabase) {
	for (const user in userDatabase) {
		if (cookie === user) {
			return true;
		}
	}
	return false;
};

module.exports = {
	getUserByEmail,
	generateRandomString,
	urlsForUser,
	cookieHasUser,
};
