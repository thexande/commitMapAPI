// bring in dependencies
var passport = require('passport')
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
var ModelBase = require('bookshelf-modelbase')(bookshelf);
var request = require('request');
var qs = require('querystring')

// declare router
router = express.Router();

// DB tables
var User = ModelBase.extend({
    tableName: 'github_users'
});
var watchedRepoTable = ModelBase.extend({
    tableName: 'user_seleted_repos'
});

// SPA route
router.route('/').get(function(req, res) {
    res.sendFile(path.join(__dirname, '../public/build/root.html'))
});

// localAuth post
router.route('/localAuth')
  .post(passport.authenticate('local'),
  function(req, res){
    res.send(req.user)
  }
)

// dashboard route
router.route('/dashboard').get(function(req, res){
  res.render('dash');
})

router.get('/userData',
function(req, res, next){
  // set auth headers to '' to avoid angular additons
  req.headers.Authorization = ''
  req.headers.authorization = ''
  // console.log(req.headers);
  // console.log(req.query);
  next()
},
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
router.post('/auth/github',
  function(req,res){
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var accessToken
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: '9b4d0ef16b573cc1c714097ae5e26899085d5d9c',
      redirect_uri: req.body.redirectUri
    }
  request.get({ url: accessTokenUrl, qs: params },
    function(err, response, accessToken) {
      accessToken = qs.parse(accessToken)
      var headers = { 'User-Agent': 'Satellizer' }
      request.get({
        url: userApiUrl,
        qs: accessToken,
        headers: headers,
        json: true }, function(err, response, profile) {
          // user profile is returned from github. check for user in db, if no user create one.
          var userFromGithubObj = profile;
          // does our user already exist in our db?
          User.findOrCreateByProperty({
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
              bearer_token: accessToken.access_token,
              jwt: 'jwtgoeshere'
          }, {
              github_id: userFromGithubObj.id
          })
          .then(function(collection) {
              if (collection) {
                // update token entry
                // User.update({
                //   bearer_token: accessToken.access_token
                // }, {
                //   github_id : 111
                // })
                // .catch((e) => {console.log(e)})

                // create entry in watched repo table
                watchedRepoTable.findOrCreateByProperty({
                  github_id: userFromGithubObj.id
                }, {
                  github_id: userFromGithubObj.id
                })
                .catch((e) => {console.log("error here" + e)})
              }
          })
        })

        // return token to angular app so user can access profile data.
        res.send({token: accessToken})
      })
  }
)

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
        res.redirect('/#/dash/?access_token=' + req.user.bearer_token );
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
