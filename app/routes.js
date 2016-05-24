// move this to the config file ASAP
// var pg = require('pg');
//
// var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';
// var client = new pg.Client(connectionString);
// client.connect();
//




// bring in dependencies
var passport = require('passport')
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
var userModel = require('./models/userModel');
router = express.Router();



// login route
router.route('/').get(function(req, res){
  res.render('login',
  { title : 'Home' }
  )
});

// dashboard route
router.route('/dash').get(function(req, res){
  res.render('dash');
});


router.route('/usertest').get(function(req, res, next){

})


// // home route
// router.route('/home').get(function(req, res) {
//     res.sendFile('/Users/alexandermurphy/Dropbox/galvanize/sidework/murphy_node_template/public/home.html');
// });
// // index route
// router.route('/').get(function(req, res) {
//     res.sendFile('/Users/alexandermurphy/Dropbox/galvanize/sidework/murphy_node_template/public/index.html')
//
// })

// post on index route experiment
// .post(function(req, res){
//   console.log(res);
// })


// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/github/callback
router.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {

    // console.log("login GOOD and here is my data: ", req.user)

    res.redirect('/');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}


//
//
// // begin crud routers
//
// router.post('/api/v1/todos', function(req, res) {
//   var data = {
//       text: req.body.text,
//       complete: false
//   };
//   crudModel.createRecord(data)
//   res.redirect('/api/v1/todos')
// });
//
// // get our todos
// router.get('/api/v1/todos', function(req, res) {
//   var results = crudModel.readRecord();
//   results.then(function(todos){
//     res.json(todos);
//   })
// });
//
// // update Object.assign(dest, source) todo!
//
// router.put('/api/v1/todos/:todo_id', function(req, res) {
//     var results = [];
//     var id = req.params.todo_id;
//     var data = {
//         text: req.body.text,
//         complete: req.body.complete
//     };
//
//     pg.connect(connectionString, function(err, client, done) {
//         if (err) {
//             done();
//             console.log(err);
//             return res.status(500).send(json({
//                 success: false,
//                 data: err
//             }));
//         }
//         // update query
//         client.query("update items set text=($1), complete=($2) where id=($3)", [data.text, data.complete, id]);
//         var query = client.query("select * from items order by id asc");
//
//         // bring our results back
//         query.on('row', function(row) {
//             results.push(row);
//         });
//         query.on('end', function() {
//             done();
//             return res.json(results);
//         })
//     });
// });
//
// // delete a todo!
// router.delete('/api/v1/todos/:todo_id', function(req, res) {
//   id = req.params.todo_id;
//   crudModel.deleteRecord(id);
//   // redirect to reload all todos
//   res.redirect('/api/v1/todos')
// });

module.exports = router;
