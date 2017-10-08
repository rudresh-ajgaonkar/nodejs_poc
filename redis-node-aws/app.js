const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const redis = require('redis')
const methodOverride = require('method-override')

const port = 3000

const app = express()

let client = redis.createClient()

client.on('connect', function(){
	console.log('Connected to Redis...')
})

app.engine('handlebars', exphbs({defaultLayout : 'main'}));
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

app.use(methodOverride('_method'));

// Search Page
app.get('/', function(req,res,next){
	res.render('searchusers');
})

app.get('/user/add', function(req, res, next){
  res.render('adduser');
});


app.delete('/user/delete/:id', function(req,res,next){
	let id = req.params.id;
	client.del(id);
	res.redirect('/')
})

app.post('/user/add', function(req,res,next){
	let id = req.body.id;
	let first_name = req.body.first_name;
	let last_name = req.body.last_name;
	let email = req.body.email;
	let phone = req.body.phone;
	let image = req.body.image;

	client.hmset(id, [
			'first_name' , first_name,
			'last_name' , last_name,
			'email' , email,
			'phone' , phone,
			'image', image
		], function(err, reply){
			if(err){
				console.log(err);
			}else{
				console.log(reply);
				res.redirect('/')
			}
		})

})


app.post('/user/search', function(req,res,next){
	console.log("Aaaa")
	let id= req.body.id;
	client.hgetall(id, function(err,obj){
		if(!obj){
			res.render('searchusers', {
				error : 'User Doesnt exist'
			});
		}else{
			obj.id = id;
			res.render('details', {
				user : obj
			})
		}
	})
})



app.listen(port, function(){
	console.log("The App is running on port 3000");
})