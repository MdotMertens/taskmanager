const some = require('./index.js')

const userRepository = require('./database/user')
const teamRepository = require('./database/team')
const todoRepository = require('./database/todo')

const app = some.makeApp({
	userRepository: userRepository,
	teamRepository: teamRepository,
	todoRepository: todoRepository
})

app.listen(8080, () => console.log(`listening on 8080`))

