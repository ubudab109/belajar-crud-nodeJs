// use path module
const path = require('path');
// use express module
const express = require('express');
// use hbs view engine  (template engine)
const hbs = require('hbs');
// use body parsher middleware (middleware untuk menghandle post body request)
const bodyParser = require('body-parser');
// use mysql database module
const mysql = require('mysql');

// use session express for login
const session = require('express-session');

const app = express();

// konfigurasi koneksi

const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'node_js'
});

conn.connect(function(err){
	if (err) throw err;
	console.log('Connected');
});


// konfigurasi session login menggunakan package express
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// set views direktori file
app.set('views',path.join(__dirname,'views'));

// set view engine
app.set('view engine','hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true,
}));
// set folder public sebagai statis folder untuk static file
app.use('/assets',express.static(__dirname + '/public'));


// route login 
app.get('/',function(req,res){

	if(!req.session.loggedIn)
		{
			res.render('login');
		}
	else{
		let sql = `SELECT * FROM produk`;
		let query = conn.query(sql, (err, result)=>{
		if (err) throw err;
		res.render('product_view',{
			results: result
		});
	});
	}
});

// route auth

app.post('/auth',function(req,res){
	var username = req.body.username;
	var password = req.body.password;

	if(username && password){
		conn.query('SELECT * FROM user WHERE username = ? AND password = ?',[username,password], (error,result,fields)=>{
			if(result.length > 0){
				req.session.loggedIn = true;
				req.session.username = username;
				res.redirect('/');
				return;
			}
			else{
				res.send('Username or Passsword is wrong');
			}
		});
	}
});

// logout

app.get('/logout',(req,res,next)=>{
	if (req.session){
		req.session.destroy(function(err){
			if (err){
				return next(err);
			}else{
				return res.redirect('/')
			}
		});
	}
});

// route get halaman register
app.get('/register', (req, res)=>{
	res.render('registerForm');
});

// route submit register
app.post('/signup', (req, res)=>{
	let data = {
		username: req.body.username,
		password: req.body.password,
		role: req.body.role
	};

	let sql = 'INSERT INTO user SET?';
	let query = conn.query(sql, data, (err, result) => {
		if (err) throw err;
		res.redirect('/');
	});
});

// route untuk insert data
app.post('/save', (req, res)=>{
	let data = {
		name: req.body.name,
		price: req.body.price
	};

	let sql = `INSERT INTO produk SET?`;
	let query = conn.query(sql, data, (err, result)=>{
		if (err) throw err;
		res.redirect('/');
	});
});

// route update data
app.post('/update', (req, res)=>{
	let data = {
		name: req.body.name,
		price: req.body.price
	};

	let sql = `UPDATE produk SET? WHERE id = ${req.body.id}`;
	let query = conn.query(sql,data,(err,result)=>{
		if (err) throw err;
		res.redirect('/');
	});
});

// route delete data
app.post('/delete', (req,res)=>{
	let sql = `DELETE FROM produk WHERE id = ${req.body.id}`;
	let query = conn.query(sql,(err,result)=>{
		if (err) throw err;
		res.redirect('/');
	});
});


// server listening
app.listen(8080, ()=>{
	console.log('Server listening on port 8080');
})