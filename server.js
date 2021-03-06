var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require ('bcrypt');

var middleware = require ('./middleware.js')(db);


var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//setup middleware
app.use(bodyParser.json());



app.get('/', function(req, res) {
	res.send('Todo API Root');
});


//GET /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	var where = {
		userId:req.user.get('id')
	};

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed = false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		where.description = {
			$like: '%' + queryParams.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});
});

//GET /todos/2
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	todoID = parseInt(req.params.id, 10);
	db.todo.findOne({where : {
		id: todoID,
		userId :req.user.get('id')
	}}).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send({
				error: "not found"
			});
		}
	}, function(e) {
		res.status(500).json(e);
	})
});

//POST
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then (function () {
			return todo.reload();
		}).then(function (todo){
			return res.json(todo);
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

//DELETE
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoID,
			userId : req.user.get('id')
		}
	}).then(function(deleted) {
		if (deleted === 0) {
			res.status(404).send({
				error: "id does not exist"
			});
		} else {
			res.json({
				success: deleted + " deleted rows"
			})
		}

	}, function(e) {
		res.status(500).send();
	});
});


//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'completed', 'description');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} else {
		//Never provided attribute, no problem here
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description.trim();
	} else {
		//Never provided attribute, no problem here
	}


	//HERE, actually update
	db.todo.findOne({where :{
		id :todoId,
		userId: req.user.get('id')

	}}).then(function(todo) {
		if (!!todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());

			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
})



////////////////////
//USERS
////////////////////

//post /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		return res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

//post /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;


	db.user.authenticate(body).then (function (user) {

		var token = user.generateToken('authentication');
		userInstance=user;
		console.log('hello !');

		return db.token.create({
			token : token
		});

	}).then(function (tokenInstance) {
		console.log('hello again!');
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	
	}).catch( function (e) {
		res.status(401).send(e);
	});
});


//DELETE /users/login

app.delete('/users/login',middleware.requireAuthentication, function (req, res) {
	req.token.destroy().then(function (){
		res.status(204).send();
	}, function () {
		res.status(500).send();
	})
});

var force = true;
db.sequelize.sync({
	force: force
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!!');
	});
});