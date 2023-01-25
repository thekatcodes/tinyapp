const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

function generateRandomString() {
    let randomString = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 6 ; i++){
        randomString += characters.charAt(Math.floor(Math.random()*characters.length))
    }
    return randomString;
}
generateRandomString()

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
app.get("/", (req, res) => {
	res.send("Hello!");
});
app.get("/hello", (req, res) => {
	res.send("<html><body>Bonjour Hi World</body></html>");
});
app.post("/login", (req, res) => {
    res.cookie('username',req.body.username);
    res.redirect('/urls');
  });
app.get("/urls", (req, res) => {
	const templateVars = { urls: urlDatabase };
	res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
    let randomString = generateRandomString();
    urlDatabase[randomString] = req.body.longURL;
    res.redirect(`urls/${randomString}`); 
});
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.newURL;
    res.redirect('/urls');
  });
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  });
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
