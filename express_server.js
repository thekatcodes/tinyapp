const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

const users = {

}
function generateRandomString() {
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
generateRandomString();

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});
app.get("/", (req, res) => {
	res.send("Hello!");
});
app.get("/hello", (req, res) => {
	res.send("<html><body>Bonjour Hi World</body></html>");
});
app.get("/register", (req, res) => {
	res.render("register");
});
app.post("/register", (req, res) => {
    let randomString = generateRandomString();
    users[randomString] = { id: randomString, email: req.body.email, password: req.body.password };
    res.cookie('user_id', randomString);
    // console.log(users)
    // console.log(users[randomString]);
    // console.log(req.cookies['user_id']);
	res.redirect("/urls");
});
app.post("/login", (req, res) => {
	res.cookie("username", req.body.username);
	res.redirect("/urls");
});
app.post("/logout", (req, res) => {
	res.clearCookie("username", req.body.username);
	res.redirect("/urls");
});
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
	res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
	let randomString = generateRandomString();
	urlDatabase[randomString] = req.body.longURL;
	res.redirect(`urls/${randomString}`);
});
app.get("/urls/new", (req, res) => {
	const templateVars = {
		user: users[req.cookies['user_id']],
	};
	res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
	const templateVars = {
		id: req.params.id,
		longURL: urlDatabase[req.params.id],
		user: users[req.cookies['user_id']],
	};
	res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
	urlDatabase[req.params.id] = req.body.newURL;
	res.redirect("/urls");
});
app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});
app.get("/u/:id", (req, res) => {
	const longURL = urlDatabase[req.params.id];
	res.redirect(longURL);
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
