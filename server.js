var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	var where ={};

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {	
		where.completed=true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		where.completed=false;
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		where.description={
						$like:'%'+queryParams.q+'%'
					}
	}

	db.todo.findAll({
		where : where	
	}).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send();
	});

});

//GET /todos/2
app.get('/todos/:id', function(req, res) {
	todoID = parseInt(req.params.id, 10);
	db.todo.findById(todoID).then(function(todo) {
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
app.post('/todos', function(req, res) {
	var body = req.body;

	db.todo.create(body).then(function(todo) {
		return res.json(todo);
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

//DELETE
app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var foundObject = _.findWhere(todos, {
		id: todoID
	});
	if (!foundObject) {
		res.status(404).send({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, foundObject);
		res.json(foundObject);
	}


});


//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var foundObject = _.findWhere(todos, {
		id: todoID
	});

	if (!foundObject) {
		return res.status(404).send();
	}

	var body = _.pick(req.body, 'completed', 'description');
	var validAttributes = {};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	} else {
		//Never provided attribute, no problem here
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description.trim();
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	} else {
		//Never provided attribute, no problem here
	}


	//HERE, actually update
	_.extend(foundObject, validAttributes);
	res.json(foundObject);

})

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!!');
	});
});