const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('tiny'));

const urlDatabase = {
    i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    },
};

const users = {};

/* Checks if given email corresponds to a user in a given database, returns true or false */
const getUserByEmail = function(email, users) {
	for (let id in users) {
		if (users[id].email === email) {
			return true;
		} else {
			return false;
		}
	}
}

/* Checks if given password corresponds to a user in a given database, returns true or false */
const getUserByPassword = function(password, users) {
	for (let id in users) {
		if (users[id].password === password) {
			return true;
		} else {
			return false;
		}
	}
}
/* Generates a random string, used for creating short URLs and userIDs */
const generateRandomString = function() {
	let randomString = "";
	let characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 6; i++) {
		randomString += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}
	return randomString;
}

// const urlsForUser = function(id, urlDatabase) {
//     const userUrls = {};
//     for (shortURL in urlDatabase) {
//         userUrls = userUrls[shortURL].userID === id;

//     }
//     return userUrls
// }
/****************************************** Application logic routes ******************************************/

// app.get("/urls.json", (_req, res) => {
// 	res.json(urlDatabase);
// });

// Redirect user to /urls page if logged in, otherwise redirect to /login
app.get("/", (req, res) => {
    const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies["user_id"]],
    };
    if (templateVars.user) {
        res.redirect("/urls");
      } else {
        res.redirect("/login");
    }
});
      
// Render urls summary page
app.get("/urls", (req, res) => {
	const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies["user_id"]],
	};
    res.render("urls_index", templateVars);
    console.log(urlDatabase)
});

//Render new url form
app.get("/urls/new", (req, res) => {
	const templateVars = {
		user: users[req.cookies["user_id"]],
    };
    if (!templateVars.user) {
        res.redirect("/login");
    } else {
        res.render("urls_new", templateVars);
    }
});

// Render page to show selected url info
app.get("/urls/:id", (req, res) => {
    urlDatabase[req.params.id].longURL;
	const templateVars = {
		id: req.params.id,
		longURL: urlDatabase[req.params.id].longURL,
		user: users[req.cookies["user_id"]],
    };
    if (!(req.params.id in urlDatabase)) {
        res.send("ID does not exist");
    } else {
        res.render("urls_show", templateVars);
    }
});

// Redirect short url to long url
app.get("/u/:id", (req, res) => {
	const longURL = urlDatabase[req.params.id].longURL;
	res.redirect(longURL);
});

// Shorten new url and redirect to that url
app.post("/urls", (req, res) => {
    let shortUrl = generateRandomString();
    
    const templateVars = {
		user: users[req.cookies["user_id"]],
    };
    if (!templateVars.user) {
        res.status(401).send("You must be logged in to a valid account to create short URLs.");
    } else {
        urlDatabase[shortUrl] = {
            longURL: req.body.longURL,
            userID: users[req.cookies["user_id"]].id
        }
        res.redirect(`urls/${shortUrl}`);
    }
});

// Update existing shortened url
app.post("/urls/:id", (req, res) => {
	urlDatabase[req.params.id].longURL = req.body.newURL;
	res.redirect("/urls");
});

// Delete existing shortened url
app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

/****************************************** Authentication related routes ******************************************/

// Render register form
app.get("/register", (req, res) => {
	const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies["user_id"]],
    };
    if (!templateVars.user) {
        res.render("register", templateVars);
    } else {
        res.redirect("/urls");
    }
});

// Render login form
app.get("/login", (req, res) => {
	const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies["user_id"]],
    };
    if (!templateVars.user) {
        res.render("login", templateVars);
    } else {
        res.redirect("/urls");
    }
});

// Add new user to database object
app.post("/register", (req, res) => {
	let submittedEmail = req.body.email;
	if (req.body.email === "" || req.body.password === "") {
		res.status(400).send("Please include both a valid email and password");
	} else if (getUserByEmail(submittedEmail, users)) {
		res.status(400).send("An account already exists for this email address");
	} else {
		let randomString = generateRandomString();
		users[randomString] = {
			id: randomString,
			email: submittedEmail,
			password: req.body.password,
		};
		res.cookie("user_id", randomString);
	}

	res.redirect("/urls");
});

// Authenticate and log user in
app.post("/login", (req, res) => {
    const templateVars = {
		urls: urlDatabase,
		user: users[req.cookies["user_id"]],
    };
    
	let submittedEmail = req.body.email;
	let submittedPw = req.body.password;

    if (!getUserByEmail(submittedEmail, users)) {
        res.status(403).send("No match found for email and password");
    } else if (
        getUserByEmail(submittedEmail, users) &&
        !getUserByPassword(submittedPw, users)
    ) {
        res.status(403).send("No match found for email and password");
    } else if (
        getUserByEmail(submittedEmail, users) &&
        getUserByPassword(submittedPw, users)
    ) {
        res.cookie("user_id", templateVars[users[req.cookies["user_id"]]].id);
		res.redirect("/urls");
    }
});

// Log user out
app.post("/logout", (req, res) => {
	res.clearCookie("user_id", req.cookies["user_id"]);
	res.redirect("/login");
});

// Start listening on PORT 8080
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
