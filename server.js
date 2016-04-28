var express = require('express');
var bodyParser=require('body-parser');
var _ = require('underscore'); 

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
	todoID=parseInt(req.params.id,10);
	var foundObject=_.findWhere(todos, {id:todoID});
	if (foundObject) {
		res.json(foundObject);
		
	}
	else {
		res.status(404).send();
	}
	
});

app.post('/todos',function (req, res) {
	var body=req.body;
	body=_.pick(body, 'completed', 'description');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0) {
		return res.status(400).send();
	}
	body.description=body.description.trim();
	body.id=todoNextId;
	res.json(body);
	todos.push(body)
	todoNextId++;
});

app.delete('/todos/:id', function (req, res) {
	todoID=parseInt(req.params.id,10);
	var foundObject=_.findWhere(todos, {id:todoID});
	if (!foundObject) {
		res.status(404).send({"error": "no todo found with that id"});
	}
	else {
		todos=_.without(todos,foundObject);
		res.json(foundObject);
	}
	

})

app.listen(PORT, function () {
	console.log('Express listening on port '+ PORT+'!!');
});

