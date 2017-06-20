var express = require('express');
var app = express();
var mysql   =     require("mysql");
var http    =     require('http').Server(app);
var io      =     require("socket.io")(http);
var router = express.Router();


/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   '',
      database          :   'fbstatus',
      debug             :   false
});

 var mysql_connection = mysql.createConnection({
    host              :   'localhost',
    user              :   'root',
    password          :   '',
    database          :   'fbstatus',
    port: 3306,
    multipleStatements: true
  });

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

app.use('/api', router);

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('status added',function(status){
      add_status(status,function(res){
        console.log(res);
        if(res==true){
            // io.emit('refreshfeed',status);
            socket.emit('refreshfeed',status);

        } else {
            socket.emit('error');
        }
      });
    });
});



var add_status = function (status,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          callback(false);
          return;
        }
    connection.query("INSERT INTO `status` (`s_text`) VALUES ('"+status+"')",function(err,rows){
            connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              return;
        });
    });
}

http.listen(3000,function(){
    console.log("Listening on 3000");
});


if(router.get('/get_comments')){
  router.get('/get_comments',function(req,res){

    sqlQuery = 'SELECT * FROM status;';
    
    // console.log(sqlQuery);
    mysql_connection.query(sqlQuery, function(err, rows, fields){

      if(err) throw err;

      if(rows.length > 0){

        res.json({data:rows});
      }
    });
  });
}


console.log('Listening to server... DIR: [' + __dirname + ']');
console.log(app.path());

