const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser, cookieHasUser } = require("./helpers");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cookieSession({
  name: 'session',
  keys: ['katie'],
  maxAge: 24 * 60 * 60 * 1000,
}));

const urlDatabase = {
    "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    },
};

const users = {};

/****************************************** Application logic routes ******************************************/

// app.get("/urls.json", (_req, res) => {
// 	res.json(urlDatabase);
// });

// Redirect user to /urls page if logged in, otherwise redirect to /login
app.get("/", (req, res) => {
    if (cookieHasUser(req.session.user_id, users)) {
      res.redirect("/urls");
    } else {
      res.redirect("/login");
    }
});
      
// Render urls summary page
app.get("/urls", (req, res) => {
	let templateVars = {
		urls: urlsForUser(req.session.user_id, urlDatabase),
		user: users[req.session.user_id],
  };
  // console.log('urls:',templateVars.urls )
  // console.log('urldatabase:', urlDatabase)
  // console.log('templateVars:', templateVars.user)
  // console.log(req.session.user_id)

  res.render("urls_index", templateVars);
});

//Render new url form
app.get("/urls/new", (req, res) => {
  if (!cookieHasUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
      let templateVars = {
        user: users[req.session.user_id],
        };
        res.render("urls_new", templateVars);
    }
});

// Render page to show selected url info
app.get("/urls/:id", (req, res) => {
	// urlDatabase[req.params.id].longURL;
	if ((urlDatabase[req.params.id])) {
    let templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      urlUserID: urlDatabase[req.params.id].userID,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("This short URL does not correspond with a long URL at this time");
  }
  // console.log(templateVars.user)
  // console.log(urlUserID)
});

// Redirect short url to long url
app.get("/u/:id", (req, res) => {
    console.log(urlDatabase)
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not correspond with a long URL at this time");
  }
});

// Shorten new url and redirect to that url
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
     res.redirect(`/urls/${shortURL}`);
    } else {
    res.status(401).send("You must be logged in to a valid account to create short URLs.");
  }
});

// Update existing shortened url
app.post("/urls/:id", (req, res) => {
const userID = req.session.user_id;
const userUrls = urlsForUser(userID, urlDatabase);

  if (!(req.params.id in userUrls)) {
    res.status(401).send("Unauthorized. You do not have authorization to edit this short URL")
  } else if (!userID) {
    res.status(401).send('Please log in to an existing account to edit URL');
  } else {
    urlDatabase[req.params.id].longURL = req.body.newURL;
    res.redirect("/urls");
  }
});

// Delete existing shortened url
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);

  if (!(req.params.id in userUrls)) {
    res.status(401).send("Unauthorized. You do not have authorization to delete this short URL")
  } else if (!userID) {
    res.status(401).send('Please log in to an existing account to delete URL');
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

/****************************************** Authentication related routes ******************************************/

// Render register form
app.get("/register", (req, res) => {

    if (cookieHasUser(req.session.user_id, users)) {
      res.redirect("/urls");
    } else {
      let templateVars = {
        user: users[req.session.user_id],
      };
      res.render("register", templateVars);
    }
});

// Render login form
app.get("/login", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
      let templateVars = {
        user: users[req.session.user_id],
      };
      res.render("login", templateVars);
    }
});

// Add new user to database object
app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;

	if (submittedEmail === "" || submittedPassword === "") {
		res.status(400).send("Please include both a valid email and password");
	} else if (getUserByEmail(submittedEmail, users) !== undefined) {
		res.status(400).send("An account already exists for this email address");
	} else {
		const newUserID = generateRandomString();
		users[newUserID] = {
			id: newUserID,
			email: submittedEmail,
			password: bcrypt.hashSync(submittedPassword, 10),
		};
		req.session.user_id = newUserID;
    res.redirect("/urls");
	}
});

// Authenticate and log user in
app.post("/login", (req, res) => {
    // let templateVars = {
		// urls: urlDatabase,
		// user: users[req.session.user_id],
    // };
    
	const email = req.body.email;
  const password = req.body.password;

  const userObj = getUserByEmail(email, users);
  
    if (getUserByEmail(email, users) === undefined) {
        res.status(403).send("No account associated with this email");
    } else if (
        getUserByEmail(email, users) !== undefined &&
        !bcrypt.compareSync(password, userObj.password))
    {
        res.status(403).send("Password entered does not match the provided email address");
    } else if (
        getUserByEmail(email, users) !== undefined &&
        bcrypt.compareSync(password, userObj.password)
    ) {
      req.session.user_id = userObj.id;
		  res.redirect("/urls");
    }
    console.log(email)
    console.log(users)
    console.log(users.id)
});

// Log user out
app.post("/logout", (req, res) => {
  req.session = null;
	res.redirect("/login");
});

// Start listening on PORT 8080
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {urlDatabase, users}
