var config = require('./knexfile.js');
var knexLogger = require('knex-logger')

var env = 'development';
// var env = 'heroku';
var knex = require('knex')(config[env]);
knex.migrate.latest([config]);



// bookshelf
bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
module.exports = knex;

// bookshelf-modelbase
var ModelBase = require('bookshelf-modelbase')(bookshelf);
