var app = require('express')();
var http = require('http').Server(app);
var mustacheExpress = require('mustache-express');
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

app.post('/login', (req,res) => {
  res.json({
    name:req.body.name
  });
  console.log(req.body);
})

http.listen(3000, () => {
  console.log('listening on *:3000');
});