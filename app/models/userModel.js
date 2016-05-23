'use strict';
let Bookshelf = require('../../config/database');
var User = Bookshelf.Model.extend({
  tableName: 'githubUsers'
})
