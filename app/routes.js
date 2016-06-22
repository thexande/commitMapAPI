// bring in dependencies
var passport = require('passport')
var pgNative = require('pg-native')
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
var ModelBase = require('bookshelf-modelbase')(bookshelf);
var request = require('request');
var qs = require('querystring')
var GitHubApi = require("github");
var databaseConfig = require('../config/database')
// github api access configuration
var github = new GitHubApi({
    debug: true,
    protocol: "https",
    host: "api.github.com",
    timeout: 5000,
    headers: {
        "user-agent": "commitMap"
    },
    followRedirects: false,
});
// declare router
router = express.Router();

// DB tables
var User = ModelBase.extend({
    tableName: 'github_users'
});
var watchedRepoTable = ModelBase.extend({
    tableName: 'user_seleted_repos'
});
var availableRepoTable = ModelBase.extend({
    tableName: 'user_available_repos'
});

// SPA route
router.route('/').get(function(req, res) {
    res.sendFile(path.join(__dirname, '../public/build/root.html'))
});

// test route for knex raw query
router.route('/raw').get((req, res) => {
  // res.send(databaseConfig.toString())
  // res.send(Object.keys(databaseConfig.select('*').from('github_users')))
  databaseConfig.select('*').from('github_users').where({github_id : 7704414})
  databaseConfig('github_users').where({github_id: 7704414}).update(
    {bearer_token: 1000}
  )
  .then((result) => {
    res.send(result)
  })
})
// localAuth post
router.route('/localAuth')
  .post(passport.authenticate('local'),
  function(req, res){
    res.send(req.user)
  }
)

// latest github repo route
router.route('/getReposFromGitHub').post(function(req, res){
  console.log(req.body);
  github.authenticate({
      type: "oauth",
      token: req.body.token
  });
  github.repos.getAll({}, function(err, response) {
      res.send(JSON.stringify(response))
  })
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
      // update watched repos json in watched_repos table after fetching record
      watchedRepoTable.findOne({id: req.user.attributes.id})
      .then((record) => {
        // record retreived from DB. now append our new id and update
        // is the record null?
        console.log(record);
        if(record.attributes.selected_repos == null){
          console.log("No ID");
          var selectedRepoArr = req.body.selected_repo_id
        }
        // handle duplicate ID. has this id been added before?
        else if((record.attributes.selected_repos.toString().indexOf((req.body.selected_repo_id.toString())) != -1) &&
          (record.attributes.selected_repos != '')){
          console.log("DUPE");
          //  repo ID already being watched
          selectedRepoArr = record.attributes.selected_repos
        }
        else if((record.attributes.selected_repos.indexOf(',') === -1) &&
          (record.attributes.selected_repos != '')){
          // no commas, so there is only one id being watched currently
          console.log("Single ID");
          var selectedRepoArr = record.attributes.selected_repos + ',' + req.body.selected_repo_id
        } else {
          // selected_repos is not null or one ID, split and append new id to watch
          console.log("multi ID");
          var selectedRepoArr = record.attributes.selected_repos.split(',')
          selectedRepoArr.push(req.body.selected_repo_id)
        }
        // new repo id added to selected repo arr. update selected_repo table with new arr
        watchedRepoTable.update({
          selected_repos: selectedRepoArr.toString()
        }, {
          id: req.user.attributes.id
        })
        // catch any error
        .catch((e) => {console.log("error here " + e)})
        .then(function(collection){
          // after, find in repos_available table, and remove
          availableRepoTable.findOne({ id: req.user.attributes.id })
            .then((result) => {
              console.log("ALTERING availableRepoTable");

              availableRepoTable.update({
                available_repos: result.attributes.available_repos.split(',').filter((i) => {
                  if(i.toString() != req.body.selected_repo_id.toString()){
                    return i
                  }
                }).join(',')
              }, {
                id: req.user.attributes.id
              })
            })

          // return to app
          res.send(collection);
        })
      })
    }
  )

// begin routes for getting and setting user_available_repos
router.get('/userAvailableRepos',
function(req, res, next){
  // set auth headers to '' to avoid angular additons
  req.headers.Authorization = ''
  req.headers.authorization = ''
  next()
},
  passport.authenticate('bearer', {session: false }),
  function(req, res){
    console.log(req.user.attributes);
    availableRepoTable.findOne({
      // id : req.user.attributes.id
      id : parseInt(req.user.attributes.id)
    }).catch(function(e){
      console.log("error on find one "+e);
    }).then(function(collection) {
      if(collection){
        res.send(collection.attributes.available_repos)
      }
    })
  })

  router.post('/userAvailableRepos',
  passport.authenticate('bearer', {session: false }),
    function(req, res){
      // update watched repos json in database
      availableRepoTable.update({
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
          console.log("attempting find or create");
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
              id: userFromGithubObj.id
          })
          .catch((e) => console.log(e))
          .then(function(collection) {
              if (collection) {
                // // update token entry
                console.log("Attempting Update");
                databaseConfig('github_users').where({github_id: userFromGithubObj.id}).update(
                  {bearer_token: accessToken.access_token}
                ).then((response) => {
                  // send token after update in github_user table
                  res.send({token: accessToken})
                })
                // create entry in watched repo table
                watchedRepoTable.findOrCreateByProperty({
                  github_id: userFromGithubObj.id
                }, {
                  github_id: userFromGithubObj.id
                })
                .catch((e) => {console.log("error here" + e)})
                // fetch available repos and store.

                github.authenticate({
                    type: "oauth",
                    token: accessToken.access_token
                });
                github.repos.getAll({}, function(err, response) {
                    var repoIds = response.map((val) => {return val.id}).toString()
                    // create entry in available_repos table and add users public repos ids
                    availableRepoTable.findOrCreateByProperty({
                      github_id: userFromGithubObj.id,
                      available_repos: repoIds
                    }, {
                      github_id: userFromGithubObj.id
                    }).then((resp) => {
                      // update table with the latest repo info is there is a record already
                      console.log('attempting update');

                      databaseConfig('user_available_repos').where({
                        github_id : userFromGithubObj.id
                      }).update({
                        available_repos: repoIds
                      }).then((res)=>{console.log(res);})
                      // TODO account for repos in watch list and filter out any repos already watching
                    })
                })
              }
          })
        })
      })
  }
)
// send our router
module.exports = router;
