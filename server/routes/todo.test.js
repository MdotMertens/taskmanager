const request = require('supertest')
const { makeApp } = require('../index')

jest.mock('../utils/middleware', () => jest.fn((req, res, next) => {
	req.id = 1
	next()
}))

describe('ToDo Router', () => {

	const todoMockRepository = {
		addToDo: jest.fn(),
		getToDo: jest.fn(),
		deleteToDo: jest.fn(),
		updateToDo: jest.fn()
	}

	const userMockRepository = {
		getIdByUsername: jest.fn(),
	}

	const teamMockRepository = {
		isUserInTeam: jest.fn(),
	}

	const app = makeApp({
		todoRepository: todoMockRepository,
		userRepository: userMockRepository,
		teamRepository: teamMockRepository
	})

	describe('POST /todo/add -> add ToDo', () => {
		const route = '/todo/add'
		describe('Adding a valid todo', () => {

			const bodyData = [
				{
					name: "An important task",
					description: "It is important",
					date_created: new Date().toISOString(),
					assignee: "testuser"
				}
			]


			for (const data of bodyData) {
				todoMockRepository.addToDo.mockReturnValue(data)
				it('Response should be in application/json', async () => {
					const response = await request(app).post(route).send(data)
					expect(response.type).toBe('application/json')
				})

				it('Response shuld have statuscode 201', async () => {
					const response = await request(app).post(route).send(data)
					expect(response.status).toBe(201)
				})

				it('Response should have a data field', async () => {
					const response = await request(app).post(route).send(data)
					expect(response.body.data).toBeDefined()
				})

				it('addToDo should be called once', async () => {
					await request(app).post(route).send(data)
					expect(todoMockRepository.addToDo).toHaveBeenCalledTimes(1)
				})
			}
		})

		describe('Adding an invalid ToDo', () => {
			const bodyData = [
				{
					name: "Test ToDo",
					description: "This is a test",
					date_created: "01-01-2062",
					assignee: "none"
				},
				{
					name: "Test ToDo",
					description: "This is a test",
					date_created: "01-01-2062",
				},
				{
					description: "This is a test",
					date_created: "01-01-2062",
					assignee: "none"
				}

			]


			for (const data of bodyData) {
				it('Response should be in application/json', async () => {
					const response = await request(app).post(route).send(data)
					expect(response.type).toBe('application/json')
				})

				it('Response should return status 400', async () => {
					const response = await request(app).post(route).send(data)
					expect(response.status).toBe(400)
				})

				it('Response should have a error message', async () => {
					const response = await request(app).post(route).send(data)
					console.log(response.body.error)
					expect(response.body.error).toBeDefined()
				})
			}
		})
	})
	describe('/todo/delete -> Delete a ToDo', () => {
		const route = '/todo/delete'

		describe('Deleting an existing ToDo personal ToDo', () => {
			beforeEach(() => {
				todoMockRepository.getToDo.mockReturnValue({
					id: 1,
					assignee: 1,
					team_name: "A-Team"
				})

				todoMockRepository.deleteToDo.mockReturnValue(true)

				teamMockRepository.isUserInTeam.mockReturnValue(true)
			})

			const data = {
				todo_id: 1,
				assignee: 1,
				team_name: "A-Team"
			}


			it('getToDo should be called with the proper aruments', async() =>{
				await request(app).delete(route).send(data)
				expect(todoMockRepository.getToDo).toHaveBeenCalledWith(data.todo_id)
			})

			it('deleteToDo should be called with the proper arguments', async() =>{
				await request(app).delete(route).send(data)
				expect(todoMockRepository.deleteToDo).toHaveBeenCalledWith(data.todo_id)
			})

			it('isUserInTeam should be called with proper arguments', async () => {
				await request(app).delete(route).send(data)
				expect(teamMockRepository.isUserInTeam).toHaveBeenCalledWith(1, data.team_name)
			})

			it('Response should have statuscode 204', async () => {
				const response = await request(app).delete(route).send(data)
				expect(response.status).toBe(204)
			})
		})

		describe('Trying to delete a ToDo that does not exist', () => {
			beforeEach(() => {
				todoMockRepository.getToDo.mockReturnValue({
					id: 1,
					assignee: 1,
					name: "A-Team"
				})

				todoMockRepository.deleteToDo.mockReturnValue(true)

				teamMockRepository.isUserInTeam.mockReturnValue(true)
			})

			it('Response should be in application/json', async () => {
				const response = await request(app).delete(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 404', async () => {
				const response = await request(app).delete(route).send(data)
				expect(response.status).toBe(404)
			})
		})

		describe('User tries to delete a ToDo that does not belong to him or his team', () => {
			it('Response should be in application/json', async () => {
				const response = await request(app).delete(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 403', async () => {
				const response = await request(app).delete(route).send(data)
				expect(response.status).toBe(403)
			})
		})

	})

	describe('PUT /todo/update -> updating a todo', () => {
		const route = '/todo/update'

		describe('Updating a ToDo that exists', () => {
			beforeEach(() => {
				todoMockRepository.getToDo.mockReturnValue({
					id: "1234",
					assignee: "auser",
					name: "Something"
				})

				todoMockRepository.updateToDo.mockImplementation(data => data)

				teamMockRepository.isUserInTeam.mockReturnValue(true)

				userMockRepository.getIdByUsername.mockReturnValue(1)
			})

			const data = {
				id: "1234",
				team_name: "Test Team",

			}
			it('Response should be in application/json', async () =>{
				const response = await request(app).put(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 200', async () =>{
				const response = await request(app).put(route).send(data)
				expect(response.status).toBe(200)
			})
			
			it('Response should have a data field', async () => {
				const response = await request(app).put(route).send(data)
				expect(response.body.data).toBeDefined()
			})

		})

		describe('Updating a Team ToDo', () => {
			beforeEach(() => {
				todoMockRepository.getToDo.mockReturnValue({
					id: "1234",
					assignee: "auser",
					name: "A-Team",
					team_name: "A-Team"
				})

				userMockRepository.getIdByUsername.mockReturnValue(2)

				teamMockRepository.isUserInTeam.mockReturnValue(true)
				
			})


			const data = {
				id: "1234",
				assignee: "someone",
				name: "A Task",
			}

			it('Response should be in application/json', async () => {
				const response = await request(app).put(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 200', async() => {
				const response = await request(app).put(route).send(data)
				expect(response.status).toBe(200)
			})

			it('Response should have a data field', async () => {
				const response = await request(app).put(route).send(data)
				expect(response.body.data).toBeDefined()
			})
		})

		describe('Updating a ToDo without permissions', () => {
			beforeEach(() => {
				todoMockRepository.getToDo.mockReturnValue({
					id: "1234",
					assignee: "auser",
					name: "A-Team",
					team_name: "A-Team"
				})

				userMockRepository.getIdByUsername.mockReturnValue(2)

				teamMockRepository.isUserInTeam.mockReturnValue(false)
				
			})

			const data = {
				id: "1234",
				assignee: "someone",
				name: "A Task",
			}

			it('Response should be in application/json', async () => {
				const response = await request(app).put(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 403', async() => {
				const response = await request(app).put(route).send(data)
				expect(response.status).toBe(403)
			})
		})

	})
})
