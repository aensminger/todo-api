var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
	// if has property && completed === 'true'
	//filteredTodos = _.where(filteredTodos)
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		})
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		})
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {


		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}



	res.json(filteredTodos);
});

//GET /todos/2
app.get('/todos/:id', function(req, res) {
	todoID = parseInt(req.params.id, 10);
	var foundObject = _.findWhere(todos, {
		id: todoID
	});
	if (foundObject) {
		res.json(foundObject);

	} else {
		res.status(404).send();
	}

});

//POST
app.post('/todos', function(req, res) {
	var body = req.body;
	body = _.pick(body, 'completed', 'description');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	res.json(body);
	todos.push(body)
	todoNextId++;
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

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!!');
});