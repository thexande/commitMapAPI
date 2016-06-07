// bring in dependencies
var passport = require('passport')
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
var ModelBase = require('bookshelf-modelbase')(bookshelf);

// declare router
router = express.Router();

// DB tables
var User = ModelBase.extend({
    tableName: 'github_users'
});

var watchedRepoTable = ModelBase.extend({
    tableName: 'user_seleted_repos'
});



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
})









// begin routes for getting and setting userWatched repos
router.get('/userWatchedRepos',
  passport.authenticate('bearer', {session: false }),
  function(req, res){
    watchedRepoTable.findOne({
      id : req.user.attributes.id
    }).catch(function(e){
      console.log("error on find one "+e);
    }).then(function(collection) {
      if(collection){
        res.send(collection)
      }
    })
  })

  router.post('/userWatchedRepos',
  passport.authenticate('bearer', {session: false }),
    function(req, res){
      // update watched repos json in database
      watchedRepoTable.update({
        selected_repos : JSON.stringify(req.body.selected_repos)
      }, {
        id : req.user.attributes.id
      })
      .catch((e) => {console.log("error here from routes.js  " + e)})
      .then(function(collection){
        res.send(collection);
      })
    }
  )







// route to recieve webhook for push event @github repo name
router.post('/webHookTest',
  function(req, res){
    console.log(res.req.body);
    res.send("woot");

  })

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
        scope: ['user:email', 'read:repo_hook', 'write:repo_hook']
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
