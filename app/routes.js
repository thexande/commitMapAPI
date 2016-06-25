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
  databaseConfig.select('*').from('github_users').where({github_id : 7704414})
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
  (req, res, next) => {
    req.headers.Authorization = ''
    req.headers.authorization = ''
    next()
  },
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
  // route to remove repos from user watch
  router.post('/removeFromWatchedUserRepos',
  (req, res, next) => {
    // set auth headers to '' to avoid angular additons
    req.headers.Authorization = ''
    req.headers.authorization = ''
    next()
  },
    passport.authenticate('bearer', {session: false}),
    (req, res) => {
      // retreive watched repos record for user from db
      databaseConfig('user_seleted_repos').where({github_id: req.user.attributes.github_id})
        .then((dbRes) => {
          var repoToRemove = JSON.parse(req.body.selected_repo)
          var userSelectedRepos = JSON.parse(dbRes[0].selected_repos)
          // db row returned. remove id from selected_repos and return to available repos.
          // is selected_repos null?
          if(userSelectedRepos != null || undefined){
            userSelectedRepos = userSelectedRepos.filter((i) => {
              return i.id != repoToRemove.id
            })
          }
          // update user_selected_repos table with new list of ids
          databaseConfig('user_seleted_repos').where({github_id: req.user.attributes.github_id})
            .update({selected_repos: JSON.stringify(userSelectedRepos)})
            .then((resp) => {
              // next table. return repo to user_available_repos
              databaseConfig('user_available_repos').where({github_id: req.user.attributes.github_id})
                .then((response) => {
                  var updatedAvailableRepos = response[0].available_repos
                  console.log("#############updatedAvailableRepos##############");
                  console.log(updatedAvailableRepos.length);
                  // user_available_repos record fetched. append selected_repo_id back into table.
                  // what if available_repos is empty?

                  if(updatedAvailableRepos == null || undefined){
                    // available_repos is empty. append our repo removed from selected repos in.
                    console.log("#############available_repos is empty#####################");
                    var availableReposWithNewRepo = repoToRemove
                  } else {
                    // available_repos is not empty. push our repoToRemove object into array
                    var availableReposWithNewRepo = updatedAvailableRepos
                    availableReposWithNewRepo.push(repoToRemove)
                  }

                  // return our user_available_repos to the database
                  databaseConfig('user_available_repos').where({github_id: req.user.attributes.github_id})
                    .update({available_repos: JSON.stringify(availableReposWithNewRepo)})
                    .catch((e) => {console.log(e)})
                    .then((user_available_repos_resp) => {
                      // now return both available_repos and selected_repos
                      databaseConfig('user_available_repos').where({github_id: req.user.attributes.github_id})
                        .then((resp) => {
                          latestUserAvailableRepos = resp[0].available_repos
                          // get selected repos
                          databaseConfig('user_seleted_repos').where({github_id: req.user.attributes.github_id})
                            .then((resp) => {
                              latestUserSelectedRepos = resp[0].selected_repos

                              // generate return object and send
                              var returnObj = {
                                latestUserSelectedRepos : latestUserSelectedRepos,
                                latestUserAvailableRepos: latestUserAvailableRepos
                              }
                              // send back object
                              res.send(returnObj)
                            })
                        })
                    })
                })
            })
        })
      })
  // route to add repos to user watch
  router.post('/userWatchedRepos',
  // middleware logging function
  (req, res, next) => {
    // set auth headers to '' to avoid angular additons
    req.headers.Authorization = ''
    req.headers.authorization = ''
    console.log("######################################################################");
    console.log(req.body)
    console.log(req.headers)
    next()
  },
  passport.authenticate('bearer', {session: false }),
    function(req, res){
      // update watched repos json in watched_repos table after fetching record
      // TODO replace
      watchedRepoTable.findOne({id: req.user.attributes.id})
      .then((record) => {
        // repo being passed from client
        var repoToAddToSelected = req.body.selected_repo
        // selected repo array from table
        console.log(record.attributes.selected_repo);
        var selectedRepos = record.attributes.selected_repos
        console.log("##########selectedRepos###############################################");
        console.log(selectedRepos);

        if(selectedRepos != null ){
          // parse json string
          selectedRepos = JSON.parse(selectedRepos)
          var repoDupe = selectedRepos.filter((i) => {
            return i.id === repoToAddToSelected.id
          })
          console.log("####################repoDupe#######################");
          console.log(repoDupe);

        }
        // conditional structure
        if(selectedRepos == null || undefined){
          console.log("No ID");
          selectedRepos = []
          selectedRepos.push(repoToAddToSelected)
        }
        // handle duplicate repo. is this repo object already inside
        // does our repo exist in user_selected_repos?
        else if(repoDupe.length > 0){
          console.log("DUPE");
          //  repo ID already being watched
          var selectedRepos = selectedRepos
        }
        else{
          // append selectedRepo Ojbect into selectedRepos array
          console.log(selectedRepos);
          selectedRepos.push(repoToAddToSelected)

        }
        // new repo id added to selected repo arr. update selected_repo table with new arr
        watchedRepoTable.update({
          selected_repos: JSON.stringify(selectedRepos)
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
              // remove all selected repos from available and update
              var newAvailableRepos = result.attributes.available_repos.filter((i) => {
                return i.id != repoToAddToSelected.id
              })
              availableRepoTable.update({
                available_repos: JSON.stringify(newAvailableRepos)
              }, {
                id: req.user.attributes.id
              })
            })
          // return to app collection of available_repos
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
      // console.log(req.user.attributes);
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

  // router.post('/userAvailableRepos',
  // passport.authenticate('bearer', {session: false }),
  //   function(req, res){
  //     // update watched repos json in database
  //     availableRepoTable.update({
  //       selected_repos : req.body.selected_repos
  //     }, {
  //       id : req.user.attributes.id
  //     })
  //     .catch((e) => {console.log("error here from routes.js  " + e)})
  //     .then(function(collection){
  //       res.send(collection);
  //     })
  //   }
  // )


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
      // commitMapHerokuSatelizer
      // client_secret: 'c1a1a683761b250ba2679109f7c2aad51ef02d99',
      // commitMapSatelizer
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
                    // latest repos from github
                    var reposFromGithub = JSON.stringify(response)
                    var reposFromGithubArr = response
                    console.log("#######################################################");
                    // create NEW entry in available_repos table and add users public repos ids
                    availableRepoTable.findOrCreateByProperty({
                      github_id: userFromGithubObj.id,
                      available_repos: reposFromGithub
                    }, {
                      github_id: userFromGithubObj.id
                    }).then((availableRepoTableResponse) => {
                      // availableRepos object from database.
                      var availableRepos = (availableRepoTableResponse.attributes.available_repos)
                      // next check user selected repos to see if any are already selected by user
                      databaseConfig('user_seleted_repos').where({github_id: userFromGithubObj.id})
                        .then((user_selected_repos_res) => {
                          var selectedRepos = JSON.parse(user_selected_repos_res[0].selected_repos)
                          // console.log(JSON.parse(user_selected_repos_res[0].selected_repos).length);
                          // console.log(availableRepos);
                          var reposFromGithubWithSelectedRemoved

                          if(selectedRepos == null ){
                            // selected_repos is empty. assign full
                            var reposFromGithubWithSelectedRemoved = reposFromGithubArr
                          }
                          // is only one repo selected?
                          else if(selectedRepos.length === 1){
                            console.log("length of one");
                            // only one repo selected. remove the single id from the availableRepos array
                            reposFromGithubWithSelectedRemoved = availableRepos.filter((i) => {
                              return i.id != selectedRepos[0].id
                            })

                          } else {
                            // many repos selected. remove all selectde repos from our latest github data
                            // loop through selected repos json. filter out all selectedRepos
                            selectedRepos.forEach((val, key) => {
                              // check to see if repo ID is present in selectedRepos index
                              selectedRepoId = val.id
                              // remove object from availableRepos array
                              availableRepos = availableRepos.filter((i) => {
                                return i.id != selectedRepoId
                              })
                            })
                            // availableRepos now has all selectedRepos removed from it
                            reposFromGithubWithSelectedRemoved = availableRepos
                          }
                          // update query after reposFromGithub have been sanitized
                          console.log(userFromGithubObj.id);
                          databaseConfig('user_available_repos').where({
                            github_id : userFromGithubObj.id
                          }).update({
                            available_repos: JSON.stringify(reposFromGithubWithSelectedRemoved)
                          }).then((res) => {
                            // console.log(res)
                          })
                        })
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
