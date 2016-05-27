var ModelBase = require('bookshelf-modelbase')(bookshelf);

module.exports = {
  findUserByToken : function(token, cb){
    console.log(token);
    process.nextTick(function(){
      // find user in our DB based on token
      var User = ModelBase.extend({
          tableName: 'github_users'
      });

      userFromDb = User.findOne({
        bearer_token : token
      })
      .then(function(collection){
        return cb(null, userFromDb);
      })
      return cb(null, null)
    });
  }
}
