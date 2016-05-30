// declare all required packages

var express = require('express');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;


var app = express();
var port = process.env.PORT || 3000;
var database = require('./config/database');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;


var path = require('path');
var Promise = require('bluebird');
var ModelBase = require('bookshelf-modelbase')(bookshelf);
var randToken = require('rand-token');
var passportConfig = require('./config/passportBearerConfig')
    // begin jwt test
var jsonwebtoken = require('jsonwebtoken');
var jwtConfig = require('./config/jwtConfig')



var GITHUB_CLIENT_ID = "05380f6466ee28cc7524";
var GITHUB_CLIENT_SECRET = "e2cd63e86c4b6090dbbace5a9282965591e37ba6";



// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// config
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(methodOverride('X-HTTP-Method-Override'));

// jade
app.set('views', path.join(__dirname, '/public/views'));
app.set('view engine', 'jade');

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// router after passport initialize
router = require('./app/routes')
app.use('/', router);

// bring in user table
var User = ModelBase.extend({
    tableName: 'github_users'
});

// Passport session setup.

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = jwtConfig.secret;


passport.use(new JwtStrategy(opts, function(jwt_payload, done) {



  console.log("in Strategy");



    User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    });
}));



// bearer token for passport
passport.use(
    new BearerStrategy(
        function(token, done) {
          User.findOne({
              bearer_token: token
          })
          .catch(function(e) {
              return done(null, false)
          })
          .then(function(collection) {
              if (collection) {
                  return done(null, collection, {
                      scope: 'all'
                  })
              }
          });
       }
    )
);

// passport local Strategy

passport.use(
  new LocalStrategy(
    function(username, password, done){
      console.log(username + password);
      process.nextTick(function(){
        User.findOne({
          login: username,
          bearer_token: password
        }).catch(function(e){
          return done(null, false)
        }).then(function(collection){
          if(collection){
            return done(null, collection)
          }
        })
      })
    }
  )
)

//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {
            // bring our data in from github api.
            var userFromGithubObj = profile._json;
            var User = ModelBase.extend({
                tableName: 'github_users'
            });

            // does our user already exist in our db?
            User.findOrCreate({
                github_id: userFromGithubObj.id
            }, {
                github_id: userFromGithubObj.id,
                login: userFromGithubObj.login,
                avatar_url: userFromGithubObj.avatar_url,
                gravatar_id: userFromGithubObj.gravatar_id,
                url: userFromGithubObj.url,
                html_url: userFromGithubObj.html_url,
                followers_url: userFromGithubObj.followers_url,
                following_url: userFromGithubObj.following_url,
                gists_url: userFromGithubObj.gists_url,
                starred_url: userFromGithubObj.starred_url,
                subscriptions_url: userFromGithubObj.subscriptions_url,
                organizations_url: userFromGithubObj.organizations_url,
                repos_url: userFromGithubObj.repos_url,
                events_url: userFromGithubObj.events_url,
                name: userFromGithubObj.name,
                company: userFromGithubObj.company,
                blog: userFromGithubObj.blog,
                location: userFromGithubObj.location,
                email: userFromGithubObj.email,
                hireable: userFromGithubObj.hireable,
                bio: userFromGithubObj.bio,
                public_repos: userFromGithubObj.public_repos,
                public_gists: userFromGithubObj.public_gists,
                followers: userFromGithubObj.followers,
                following: userFromGithubObj.following,
                bearer_token: accessToken,
                jwt: jsonwebtoken.sign(userFromGithubObj, jwtConfig.secret, {
                    expiresIn: 100000
                })
            })

            .then(function(collection) {
                if (collection) {
                    return done(null, collection.attributes);
                }
            })
        });
    }
));

app.listen(port);
console.log("App listening on port " + port);
