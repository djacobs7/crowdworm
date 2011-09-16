
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

//mongo

require.paths.unshift('support/mongoose/lib');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wormweb');


var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;




var ImageSchema = new Schema({
	url:String,
	name: String,
});	

var TagSchema = new Schema({
	width: Number,
	height: Number,
	top:Number,
	left:Number,
	label:String,
	imageId: ObjectId
});

var Tag = mongoose.model('tag', TagSchema );
var Image = mongoose.model('image', ImageSchema );
// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});


app.get('/img/:id', function(req,res){
	Image.find({ name: req.params.id },function( err, images ){
		if ( !err ){
			res.render('img.ejs', {
				layout:false,
				image: images[0]
		
			});			
			
		}
	});

});


app.delete('/tag', function(req,res){
	var id = req.body.id;
	Tag.find({id:id}, function(err, tags){

		tags.forEach(function( tag ){
			tag.remove();
		});
		
	});
	

});
app.post('/tag', function(req, res){
	//need to render back the newly created tag id
	var tag = new Tag();
	tag.label = req.body.label;
	tag.width = req.body.width;
	tag.height = req.body.height;
	tag.top = req.body.top;
	tag.left = req.body.left;
	tag.imageId = req.body.imageId;
	tag.save(function(err){
		res.send({id:tag.id});

	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
