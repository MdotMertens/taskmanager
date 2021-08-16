const Router = require('express-promise-router')
const router = new Router()

const checkToDo = require('../utils/todo')

const authRequest = require('../utils/middleware')

module.exports = (todoRepository, userRepository, teamRepository) => {
  router.post('/add', authRequest, async (req, res) => {
    if (!checkToDo.checkAddToDoSchema(req.body)) {
      res.status(400).json({ error: checkToDo.checkAddToDoSchema.errors })
    }

    let assigneeId //Id of User who is assigned the task
    let isInTeam // Whether the user belongs to the team to which the ToDo gets added

    // Create the task if the assignee is also the creator or if the
    // creator is in the team that the Task is created for
    if (req.body.assignee) {
      assigneeId = await userRepository.getIdByUsername(req.body.assignee)
    } else {
      isInTeam = await teamRepository.isUserInTeam(req.id, req.body.team_name)
    }

    if (!req.id == assigneeId && !isInTeam) {
      res.status(400).send()
    }

    res.status(201).json({ data: await todoRepository.addToDo(req.body) })
  })

  router.delete('/delete', authRequest, async (req, res) => {
    const todo = await todoRepository.getToDo(req.body.todo_id)

    if (!todo) {
      res.status(404).json()
    }

    const isOwnToDo = req.id === todo.assignee
    const isInTeam = await teamRepository.isUserInTeam(req.id, todo.team_name)

    // Check whethcer the Task belongs to the user itself or if the task
    // belongs to the team.
    if (!isOwnToDo && !isInTeam) {
      res.status(403).json()
    }

    await todoRepository.deleteToDo(todo.id)
    res.status(204).json()
  })

  router.put('/update', authRequest, async (req, res) => {
    if (!checkToDo.checkUpdateToDoSchema(req.body)) {
      res.status(400).json({ error: checkToDo.checkUpdateToDoSchema.errors })
    }

    const todo = await todoRepository.getToDo(req.body.todo_id)

    if (!todo) {
      res.status(404).send()
    }

    const assigneeId = await userRepository.getIdByUsername(todo.assignee)
    const isInTeam = await teamRepository.isUserInTeam(req.id, todo.team_name)
    const isOwnToDo = req.id === assigneeId

    //Todo can only be edited if the user is the assignee or is in the team
    if (!isOwnToDo && !isInTeam) {
      res.status(403).send()
    }

    // Using spread operator to update the todo
    const updatedTodo = { ...todo, ...req.body }
    await todoRepository.updateToDo()
    res.status(200).json({ data: updatedTodo })
  })

  return router
}
