const db = require('./index')


async function addToDo(todo) {
	await db.query({
		text: `INSERT INTO \"todos\"
			       (id, name, description, date_created, date_due, done, assignee, team, date_finished)
				   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		values: [todo.id, todo.name, todo.description, todo.date_created, todo.date_due, todo.done, todo.assignee, todo.team, todo.date_finished]
	})
}

async function deleteToDo(id) {
	await db.query({
		text: `DELETE FROM \"todos\"
			   WHERE id=$1`,
		values: [id]
	})
	return true
}

async function updateToDo(todo) {
	const updatedTodo = await db.query({
		text: `UPDATE \"todos\" 
			       set name = $2,
				   set description = $4,
				   set date_created = $5,
				   set date_due = $6,
				   set done = $7,
				   set assignee = $8,
				   set team = $9,
				   set date_finished = $10
			   WHERE id=$1
		       RETURNING *`,
		values: [todo.id, todo.name, todo.description, todo.date_created, todo.date_due, todo.done, todo.assignee, todo.team, todo.date_finished]
	})
	return updatedTodo
}

module.exports = {
	addToDo,
	deleteToDo,
	updateToDo
}
