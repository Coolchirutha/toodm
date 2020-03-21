// Importing and adding variables
var express = require('express');
var bodyParser = require('body-parser');
var sessions = require('express-session');
var session;
var app = express();

// Adding middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(sessions({
    secret: 'zen-o-sama',
    resave: false,
    saveUninitialized: true
}));

// Routing
app.get('/login', function(req,resp) {
    session = req.session;
    if(session.uniqueID) {
        resp.redirect('/redirects');
    }
    resp.sendFile('./views/index.html', {root: __dirname});
});

app.post('/login',function(req,resp) {
    // resp.end(JSON.stringify(req.body));
    session = req.session;
    if(session.uniqueID) {
        req.redirect('/redirects');
    }
    if(req.body.username=='admin' && req.body.password=='admin') {
        session.uniqueID = req.body.username;
    }
    resp.redirect('/redirects');
});

app.get('/logout', function(req, resp) {
    req.session.destroy();
    resp.redirect('/login');
});

app.get('/download', function(req, resp) {
    resp.download('./views/index.html');
});

app.get('/redirects', function(req, resp) {
    session = req.session;
    if(session.uniqueID) {
        resp.end("You are logged in!!");
    } else
    resp.send('Who Are You? <a href="/logout">Kill session</a>')
});

app.listen(3000, function() {
    console.log("Listening at port 3000");
    console.log("Server started at http://127.0.0.1:3000");
});
