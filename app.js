var app = require('express')();
var http = require('http').Server(app);
var mustacheExpress = require('mustache-express');
var io = require('socket.io')(http);
let {PythonShell} = require('python-shell')
const fs = require('fs');
var csvWriter = require('csv-write-stream')
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
    //storing message in out.csv to classify as hatespeech or not.
    var writer = csvWriter();
    writer.pipe(fs.createWriteStream('backend/out.csv'));
    writer.write({id: 1, comment_text: msg});
    writer.end();
    PythonShell.run('backend/clf.py', null, function (err) {
      if (err) throw err;
      console.log('finished');
    });
    console.log('message is :' + msg);
    io.sockets.emit('chat message',msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  }); 
});
function callName(req, res) { 
      
  // Use child_process.spawn method from  
  // child_process module and assign it 
  // to variable spawn 
  var spawn = require("child_process").spawn; 
    
  // Parameters passed in spawn - 
  // 1. type_of_script 
  // 2. list containing Path of the script 
  //    and arguments for the script  
    
  // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
  // so, first name = Mike and last name = Will 
  var process = spawn('python',["./backend/clf.py"]); 

  // Takes stdout data from script which executed 
  // with arguments and send this data to res object 
  process.stdout.on('data', function(data) { 
      res.send(data.toString()); 
  } ) 
} 
/*app.post('/send_message', (req,res) => {
  res.json({
    message:req.body.message
  });
  console.log(req.body);
})*/

http.listen(3000, () => {
  console.log('listening on *:3000');
});