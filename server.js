// declare all required packages

var express = require('express');
var app = express();
var mongoose = require('mongoose');
var port = process.env.PORT || 8080;
var database = require('./config/database');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

// config
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

// jade
app.set('views', path.join( __dirname , '/public/views'));
console.log('views');
console.log('views', __dirname + '/../public/views');
app.set('view engine', 'jade');


// router
router = require('./app/routes')
app.use('/', router);



app.listen(port);
console.log("App listening on port " + port);
