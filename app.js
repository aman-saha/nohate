var app = require('express')();
var http = require('http').Server(app);
var mustacheExpress = require('mustache-express');
var io = require('socket.io')(http);
const fs = require('fs');
const body_parser = require('body-parser');

//bodyparser
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.get('/', function(req, res){
  res.render('index');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message',function(msg){
    fs.writeFile('backend/out.txt','id\comment_text',(err)=>{
      if(err)
        throw err;
      });
    
    let outMsg = '1\' + msg;
    fs.appendFile('backend/out.txt',outMsg,(err)=>{
      if(err)
        throw err;
      console.log('Message Saved');
    });
    console.log('message is :' + msg);
    io.sockets.emit('chat message',msg);
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