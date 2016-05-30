var jwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').extractJwt;
var jwtConfig = require('./jwtConfig');
var ModelBase = require('bookshelf-modelbase')(bookshelf);


// bring in user table
var User = ModelBase.extend({
    tableName: 'github_users'
});

//
// // bearer token for passport
// passport.use(
//     new BearerStrategy(
//         function(token, done) {
//
//           User.findOne({
//                   bearer_token: token
//               })
//               .catch(function(e) {
//                   return done(null, false)
//               })
//               .then(function(collection) {
//                       if (collection) {
//                           console.log("user found!!!!!!!!!!!!");
//                           return done(null, collection, {
//                               scope: 'all'
//                           })
//
//                       }
//                   }
//               );
//         }
//     )
// );




module.exports = function(passport){
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;
  passport.use(new jwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload)
    User.findOne({
      jwt : jwt_payload.token
    })
    .catch(function(e){
      return done(null, false)
    })
    .then(function(collection){
      done(null, collection)
    })
  }))
}
