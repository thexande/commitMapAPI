'use strict';
let Bookshelf = require('../../config/database');

var User = Bookshelf.Model.extend({
  tableName: 'githubUsers',
  create: function(data, options){
    return this.forge(data).save(null, options);
  }
})

module.exports = Bookshelf.model('user', User);
