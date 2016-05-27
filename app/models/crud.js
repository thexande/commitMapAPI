// var pg = require('pg');
// var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';
// var client = new pg.Client(connectionString);
// client.connect();
//
//
// module.exports = {
//   createRecord : function(data) {
//     var results = [];
//
//     // get a pg client from the connection pool
//     pg.connect(connectionString, function(err, client, done) {
//         // errors yo
//         if (err) {
//             done();
//             console.log(err);
//             return res.status(500).json({
//                 success: false,
//                 data: err
//             });
//         }
//         // query to insert data
//         client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text, data.complete]);
//         // query to select data
//         var query = client.query("SELECT * FROM items ORDER BY id ASC");
//         // stream results from query back one row at a time.
//         query.on('row', function(row) {
//             results.push(row);
//         });
//         // close connection and return results after all
//         query.on('end', function() {
//             done();
//
//         });
//     });
//   },
//   readRecord : function(cb) {
//     var promise = new Promise(function (resolve, reject){
//       var results = [];
//       return pg.connect(connectionString, function(err, client, done) {
//           // Handle connection errors
//           if (err) {
//               done();
//               console.log(err);
//               return res.status(500).json({
//                   success: false,
//                   data: err
//               });
//           }
//           // SQL Query > Select Data
//           var query = client.query("SELECT * FROM items ORDER BY id ASC;");
//
//           // Stream results back one row at a time
//           query.on('row', function(row) {
//               results.push(row);
//           });
//           // After all data is returned, close connection and return results
//           query.on('end', function() {
//
//               done();
//               return resolve(results)
//           });
//
//       });
//     })
//      return promise;
//   },
//   // updateRecord : function(request, response) {
//   //
//   // },
//   deleteRecord : function(id) {
//     var results = [];
//
//     // Get a Postgres client from the connection pool
//     pg.connect(connectionString, function(err, client, done) {
//         // Handle connection errors
//         if(err) {
//           done();
//           console.log(err);
//           return res.status(500).json({ success: false, data: err});
//         }
//
//         // SQL Query > Delete Data
//         client.query("DELETE FROM items WHERE id=($1)", [id]);
//
//         // SQL Query > Select Data
//         var query = client.query("SELECT * FROM items ORDER BY id ASC");
//
//         // Stream results back one row at a time
//         query.on('row', function(row) {
//             results.push(row);
//         });
//
//         // After all data is returned, close connection and return results
//         query.on('end', function() {
//             done();
//         });
//     });
//   }
// }
