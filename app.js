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

// Redirecting guests to login if they try to access logged in links
const redirectToLogin = (req, resp, next) => {
	if (!req.session.uniqueID) {
		// If user is not logged in, DO THIS
		resp.redirect('/login');
	} else {
		// If user is logged in, DO THIS
		next();
	}
}; // Redirecting logged in users to homepage if they try to access login links
const redirectToHome = (req, resp, next) => {
	if (!!req.session.uniqueID) {
		// If user is logged in, DO THIS
		resp.redirect('/dashboard');
	} else {
		// If user is not logged in, DO THIS
		next();
	}
};

// Login Route GET request handler
app.get('/login', redirectToHome, (req, resp) => {
	session = req.session;
	if (session.uniqueID) {
		// If already logged in send here
		resp.redirect('/redirects');
	} // If not logged in send here
	resp.sendFile('./views/index.html', { root: __dirname });
});

// Login POST request handler
app.post('/login', redirectToHome, (req, resp) => {
	username = req.body.username;
    password = req.body.password;
    sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(sql, [username, password], function(err, row) {
        if (err) {
            console.log('error');
        } else {
            if(typeof row !== 'undefined' && row.length > 0){
                resp.sendFile('./views/todo.html', { root: __dirname });
            } else resp.sendFile('./views/index.html', { root: __dirname });
        }
    });
});

// Register Route
app.get('/register', redirectToHome, (req, resp) => {});

app.post('/register', redirectToHome, (req, resp) => {});

// User Dashboard Route
app.get('/dashboard', redirectToLogin, (req, resp) => {
	resp.sendFile('./views/dashboard.html', { root: __dirname });
});

// Logout Route
app.get('/logout', redirectToLogin, (req, resp) => {
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
