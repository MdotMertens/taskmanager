const Router = require('express-promise-router')
const router = new Router()

const checkToDo = require('../utils/todo')

const authRequest = require('../utils/middleware') 

module.exports = (todoRepository, userRepository) => {
	router.post('/add', authRequest, async (req, res) => {
		if(checkToDo.checkAddToDoSchema(req.body)){
			const todo = await todoRepository.addToDo(req.body)
			res.status(201).json({data: todo})
		} else {
			res.status(400).json({error: checkToDo.checkAddToDoSchema.errors})
		}
	})
	
	return router
}
