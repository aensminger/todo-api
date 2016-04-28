var express = require('express');
var app=express();
var PORT=process.env.PORT || 3000;
var todos=[{
	id: 1,
	description: 'Finish this course',
	completed : false
}, 
{
	id: 2,
	description: 'Do workout',
	completed: false
},
{
	id: 3,
	description: 'Eat healthy',
	completed: true
}];

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
	
})

app.listen(PORT, function () {
	console.log('Express listening on port '+ PORT+'!!');
});

