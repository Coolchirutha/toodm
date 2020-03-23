// Importing and adding variables
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var sessions = require('express-session');
var session;
var app = express();
const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
	PORT = 3000,
	NODE_ENV = 'development',
	SESS_NAME = 'sid',
	SESS_LIFETIME = TWO_HOURS,
	SESS_SECRET = 'zen-o-sama'
} = process.env;

const IN_PROD = NODE_ENV === 'production';

// Defining mySQL connection parameters
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'tood'
});

// Making connection to mySQL database
/*
connection.connect(function(error) {
	if (!!error) {
		console.log('Error');
	} else console.log('Connected to db!');
});
*/

connection.query('SELECT * FROM users', (err, rows) => {
	if (!!err) {
        console.log('error');
    }

	console.log('Data received from Db:');
	console.log(rows);
});

// Adding middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	sessions({
		secret: SESS_SECRET,
		resave: false,
		saveUninitialized: true,
		name: SESS_NAME,
		cookie: {
			maxAge: SESS_LIFETIME,
			sameSite: true,
			secure: IN_PROD /* Strict */
		}
	})
);

//              ROUTING

// Login Route GET request handler
app.get('/login', (req, resp) => {
	session = req.session;
	if (session.uniqueID) {
		// If already logged in send here
		resp.redirect('/redirects');
	} // If not logged in send here
	resp.sendFile('./views/index.html', { root: __dirname });
});

// Login POST request handler
app.post('/login', (req, resp) => {
	// resp.end(JSON.stringify(req.body));
	//making connection to database and storing values from form in variables
	// connection.connect();
	console.log(req.body);
	name = req.body.username;
	email = req.body.email;
	password = req.body.password;

	session = req.session;
	if (session.uniqueID) {
		// If already logged in send here
		req.redirect('/redirects');
	} // Handling login requests
	if (req.body.username == 'admin' && req.body.password == 'admin') {
        session.uniqueID = req.body.username;
        req.redirect('/dashboard');
	}
});

// Register Route
app.get('/register',(req,resp) => {

});

app.post('/register',(req,resp) => {

});

// User Dashboard Route
app.get('/dashboard', (req,resp) => {
    resp.sendFile('./views/dashboard.html', { root: __dirname });
});

// Logout Route
app.get('/logout', (req, resp) => {
	req.session.destroy();
	resp.redirect('/login');
});

// Redirects Route
app.get('/redirects', (req, resp) => {
	session = req.session;
	if (session.uniqueID) {
		resp.end('You are logged in!!');
	} else resp.send('Who Are You? <a href="/logout">Kill session</a>');
});

// Starting Server
app.listen(PORT, () => {
	console.log(`Listening at port: ${PORT}`);
	console.log(`Server started at http://127.0.0.1:${PORT}`);
});
