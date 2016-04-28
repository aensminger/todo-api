var express = require('express');

var bodyParser=require('body-parser');

var app=express();
var PORT=process.env.PORT || 3000;
var todos=[];
var todoNextId = 1;

//setup middleware
app.use(bodyParser.json());



app.get('/', function (req, res) {
	res.send('Todo API Root');
});


//GET /todos
app.get('/todos', function(req, res) {
	res.json(todos);
});

//GET /todos/2
app.get('/todos/:id', function(req,res) {
	var foundObject;
	todoID=parseInt(req.params.id,10);
	todos.forEach(function (todo) {
		if (todo.id === todoID) {
			foundObject=todo;
		}
	})
	if (foundObject) {
		res.json(foundObject);
		
	}
	else {
		res.status(404).send();
	}
	
});

app.post('/todos',function (req, res) {
	var body=req.body;
	var todo={
		id : todoNextId,
		description: body.description,
		completed : body.completed

	}
	res.json(todo);
	todos.push(todo)
	todoNextId++;
});

app.listen(PORT, function () {
	console.log('Express listening on port '+ PORT+'!!');
});

