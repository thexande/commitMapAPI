module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/commitmap',
      migrations: {
        'directory': __dirname+"/migrations",
        tableName: "users"
      }
    },
    heroku: {
      client: 'pg',
      connection: HEROKU_POSTGRESQL_COLOR_URL,
      ssl: true,
      migrations: {
        'directory': __dirname+"/migrations",
        tableName: "users"
    }
}
