// move this to the config file ASAP
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';
var client = new pg.Client(connectionString);
client.connect();


// begin routers
var crudModel = require('./models/crud.js')
var express = require('express')
var path = require('path');
router = express.Router();


// home route
router.route('/home').get(function(req, res) {
    res.sendFile('/Users/alexandermurphy/Dropbox/galvanize/sidework/murphy_node_template/public/home.html');
});
// index route
router.route('/').get(function(req, res) {
    res.sendFile('/Users/alexandermurphy/Dropbox/galvanize/sidework/murphy_node_template/public/index.html')

})
.post(function(req, res){
  console.log(res);
})

router.post('/api/v1/todos', function(req, res) {
  var data = {
      text: req.body.text,
      complete: false
  };
  crudModel.createRecord(data)
  res.redirect('/api/v1/todos')

});

// get our todos
router.get('/api/v1/todos', function(req, res) {
  var results = crudModel.readRecord();
  results.then(function(todos){
    console.log("***EXPERSS******");
    console.log(todos);
    res.json(todos);
  })

  // var results = [];
  // // Get a Postgres client from the connection pool
  // pg.connect(connectionString, function(err, client, done) {
  //     // Handle connection errors
  //     if (err) {
  //         done();
  //         console.log(err);
  //         return res.status(500).json({
  //             success: false,
  //             data: err
  //         });
  //     }
  //     // SQL Query > Select Data
  //     var query = client.query("SELECT * FROM items ORDER BY id ASC;");
  //     // Stream results back one row at a time
  //     query.on('row', function(row) {
  //         results.push(row);
  //     });
  //     // After all data is returned, close connection and return results
  //     query.on('end', function() {
  //         done();
  //         return res.json(results);
  //     });
  // });


});

router.put('/api/v1/todos/:todo_id', function(req, res) {
    var results = [];
    var id = req.params.todo_id;
    var data = {
        text: req.body.text,
        complete: req.body.complete
    };

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).send(json({
                success: false,
                data: err
            }));
        }
        // update query
        client.query("update items set text=($1), complete=($2) where id=($3)", [data.text, data.complete, id]);
        var query = client.query("select * from items order by id asc");

        // bring our results back
        query.on('row', function(row) {
            results.push(row);
        });
        query.on('end', function() {
            done();
            return res.json(results);
        })
    });
});

router.delete('/api/v1/todos/:todo_id', function(req, res) {

    var results = [];

    // Grab data from the URL parameters
    var id = req.params.todo_id;


    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Delete Data
        client.query("DELETE FROM items WHERE id=($1)", [id]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });
    });

});

module.exports = router;
