module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/commitmap',
    migrations: {
      'directory': __dirname+"/migrations",
      tableName: "users"
    }
    }
}
