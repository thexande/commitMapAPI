module.exports = {
    development: {
        client: 'pg',
        connection: 'postgres://localhost/commitmap',
        migrations: {
            'directory': __dirname + "/migrations",
            tableName: "users"
        }
    },
    linux: {
      client: 'pg',
      connection: {
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        database: 'commitmap',
      },
      migrations: {
        'directory': __dirname + "/migrations",
        tableName: 'users'
      }
    },
    heroku: {
        client: 'pg',
        connection: {
            host: 'ec2-54-225-100-236.compute-1.amazonaws.com',
            user: 'bnuyasuurdfknw',
            password: '35r-GerA0FnfrALsNrVupnNFgK',
            database: 'd951o1es8og0g6'
        },
        ssl: true,
        migrations: {
            'directory': __dirname + "/migrations",
            tableName: "users"
        }
    }
}
