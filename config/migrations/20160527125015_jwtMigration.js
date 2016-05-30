
exports.up = function(knex, Promise) {
    return knex.schema.createTableIfNotExists('github_users', function(table){
    table.increments('uid').primary();
    table.integer('github_id');
    table.text('login');
    table.integer('id')
    table.text('avatar_url');
    table.text('gravatar_id');
    table.text('url');
    table.text('html_url');
    table.text('followers_url');
    table.text('following_url');
    table.text('gists_url');
    table.text('starred_url');
    table.text('subscriptions_url');
    table.text('organizations_url');
    table.text('repos_url');
    table.text('events_url');
    table.text('received_events_url');
    table.text('name');
    table.text('company');
    table.text('blog');
    table.text('location');
    table.text('email');
    table.text('hireable');
    table.text('bio');
    table.integer('public_repos');
    table.integer('public_gists');
    table.integer('followers');
    table.integer('following')
    table.text('bearer_token');
    table.text('jwt')
    table.text('created_at');
    table.text('updated_at');
    })
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('github_users');
};
