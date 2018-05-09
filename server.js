var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/messageBoard');

var CommentSchema = new mongoose.Schema({
    name: {type: String},
    comment: {type: String}
}, {timestamps: true})

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    message: {type: String, required: true, minlength: 3},
    comments: [CommentSchema] 
}, {timestamps: true})

var Message = mongoose.model('Message', MessageSchema);
var Comment = mongoose.model('Comment', CommentSchema);
mongoose.Promise = global.Promise;

//-----------------------------------------------------------------------------

app.get('/', function(req, res){
    Message.find({}, function(err, data){
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            res.render('index', {data:data});
        }
    })
})

app.post('/message', function(req, res){
    console.log("POST DATA", req.body);
    var message = new Message({
        name: req.body.messageName,
        message: req.body.message
    })
    message.save(function(err){
        if(err){
            console.log('something went wrong');
        } else {
            console.log('sucessfully added a message')
        }
        res.redirect('/')
    })
})

app.post('/comment/:id', function(req, res){
    Comment.create(req.body, function(err, data){
        if(err){
            console.log(err);
            res.send(err)
        }
        else{
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: data}}, function(err, data){
                console.log('updated comment')
            })
        }
        res.redirect('/')
    })
})



app.listen(8000, function() {
    console.log("listening on port 8000");
})