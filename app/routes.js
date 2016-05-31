// bring in dependencies
var passport = require('passport')
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
var ModelBase = require('bookshelf-modelbase')(bookshelf);

// declare router
router = express.Router();

// login route
router.route('/').get(function(req, res) {
    res.render('login', {
        title: 'Home'
    })
});

// localAuth post
// router.post('/localAuth'
//   // passport.authenticate('local'),
//   function(req, res){
//     res.send("authenticated");
//
// })
router.route('/localAuth').post(
  passport.authenticate('local'),
  function(req, res){
    res.send(req.user)
  }
)

// dashboard route
router.route('/dashboard').get(function(req, res){
  res.render('dash');
})

router.get('/userData',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.send(req.user);
});

// jwt testing

// router.get('/jwt',
//   passport.authenticate('jwt', { session: false }),
//   function(req, res){
//   console.log('jwt success')
//   res.send(req.user);
//
// })



router.get('/profile', passport.authenticate('jwt', { session: false}),
    function(req, res) {
        res.send(req.user.profile);
    }
);



// // dynamic route
// router.get('/dash/:user', passport.authenticate('github', {
//     session: false
// }), function(req, res) {
//     // res.json(req.user);
//     console.log("authenticated");
// });

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
router.get('/auth/github',
    passport.authenticate('github', {
        scope: ['user:email']
    }),
    function(req, res) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/dashboard?access_token=' + req.user.bearer_token );
    });

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

// send our router
module.exports = router;
