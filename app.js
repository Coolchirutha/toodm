// Importing and adding variables
const express = require('express');
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
app.use((req, resp, next) => {
    const { userId } = req.session;
    if(userId) {
        resp.locals.userUniqueID = userId;
    }
    next();
});

console.log(__dirname);
// Set view engine as EJS
app.engine('html', require('ejs').renderFile);

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
		return resp.redirect('/todo');
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
			// If there is an error in executing the statements
			console.log('error');
		} else {
			if (typeof row !== 'undefined' && row.length > 0) {
				// If login credentials are correct
				req.session.userId = row[0].username;
				return resp.redirect('/todo');
			} else {
				// If login credentials are wrong
				resp.sendFile('./views/index.html', { root: __dirname });
			}
		}
	});
});

// Register Route
app.get('/register', redirectToHome, (req, resp) => {
	return resp.redirect('/login');
});

app.post('/register', redirectToHome, (req, resp) => {
	name = req.body.fullName;
	username = req.body.username;
	password = req.body.password;
	sql = 'SELECT * FROM users WHERE username = ?';
	connection.query(sql, [username], function(err, row) {
		if (err) {
			// If there is an error in executing the statements
			console.log('error');
		} else {
			if (typeof row !== 'undefined' && row.length > 0) {
				// If username is already in database
				return resp.redirect('/login');
			} else {
				// If username is not there then we can add to database
				sqlQuery =
					'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';
				connection.query(
					sqlQuery,
					[name, username, password],
					(err, row) => {
						if (err) {
							// If there is any error in executing the statements
							console.log('error');
							return resp.redirect('/login');
						} else {
							// If registering is successful.
							req.session.userId = username;
							return resp.redirect('/todo');
						}
					}
				);
			}
		}
	});
});

app.get('/todo', (req, resp) => {
    username = resp.locals.userUniqueID;
    resp.render(__dirname + "/views/todo.html", {username: username});
});

// Logout Route
app.get('/logout', redirectToLogin, (req, resp) => {
	req.session.destroy(err => {
		if (err) {
			return resp.redirect('/todo');
		}

		resp.clearCookie(SESS_NAME);
		return resp.redirect('/login');
	});
});

// Redirects Route
app.get('/redirects', (req, resp) => {
	session = req.session;
	if (session.uniqueID) {
		resp.end('You are logged in!!');
	} else resp.send('Who Are You? <a href="/logout">Kill session</a>');
});

// Listening to the port
app.listen(PORT, () => {
	console.log(`Listening at port: ${PORT}`);
	console.log(`Server started at http://127.0.0.1:${PORT}`);
});
