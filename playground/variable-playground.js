/*var person = {
	name: 'Andrew',
	age: 21
};

function updatePerson (obj) {
	obj.age=24;
}


updatePerson(person);
console.log(person);
*/


//Array example

var grades=[15,37];

function addGrade(grades) {
	grades.push(55);
}

function addGrade2(gradesArr) {
	gradesArr = [15,37,55]
	debugger;
}

console.log(grades);
addGrade2(grades);
console.log(grades);