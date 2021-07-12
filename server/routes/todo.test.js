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
		getIdByName: jest.fn(),
	}

	const app = makeApp({ todoRepository: todoMockRepository, userRepository: userMockRepository })
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

			
			for (const data of bodyData){
				it('Response should be in application/json', async() => {
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
})
