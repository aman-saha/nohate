var app = require('express')();
var http = require('http').Server(app);
var mustacheExpress = require('mustache-express');
var io = require('socket.io')(http);
var request = require('request');
const fs = require('fs');
var csvWriter = require('csv-write-stream');
const body_parser = require('body-parser');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'messages'
});

connection.connect(function(err){
  if(!err) {
      console.log("Database is connected ... \n\n");  
  } else {
      console.log("Error connecting database ... \n\n");  
  }
});

//bodyparser
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

//Rendering the index.html file
app.get('/', function(req, res){
  res.render('index');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message',function(msg){
    //storing message in out.csv to classify as hatespeech or not.
    var writer = csvWriter();
    writer.pipe(fs.createWriteStream('backend/out.csv'));
    writer.write({id: 1, comment_text: msg});
    writer.end();
    console.log('message is :' + msg);
    request.post(
      'http://127.0.0.1:5000/classify',
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var val = Number(body);
            console.log(val);
            if(val == 1){
              let query = "INSERT INTO data(message,type) VALUES('msg','nothatespeech')";
              connection.query(query,function(err,result){
                if(err)
                  throw err;
                console.log("Data Inserted");
              });
              io.sockets.emit('chat message',msg);
            }
            else{
              let query = "INSERT INTO data(message,type) VALUES('msg','hatespeech')";
              connection.query(query,function(err,result){
                if(err)
                  throw err;
                  console.log("Data inserted");
              });
            }
            
          }
      }
  );
    
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  }); 
});
/*app.post('/send_message', (req,res) => {
  res.json({
    message:req.body.message
  });
  console.log(req.body);
})*/

http.listen(3000, () => {
  console.log('listening on *:3000');
});