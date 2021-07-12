const {makeApp} = require('../index.js')
const request = require('supertest')

let app

const mockUserRepository = {
	registerUser: jest.fn() ,
	loginUser: jest.fn(),
	getInvites: jest.fn(),
	acceptTeamInvite: jest.fn(),
	deleteTeamInvite: jest.fn(),
}

beforeAll(() =>{
	app = makeApp({userRepository: mockUserRepository})
})


describe('Testing User Router', () =>{
	describe('POST /user/register --> create new user', () => {
		const route = '/user/register'
		describe('Registering with valid body', () => {
			const bodyData = [
				{
				username: "R.User",
				password: "1234",
				email: "it@aspecialemail.com",
				firstName: "it",
				lastName: "user"
				}
			]
			for(const data of bodyData) {
				it('Response should be in application/json', async() => {
					const response = await request(app).post(route).send(data)
					expect(response.type).toBe('application/json')
				})
				it('Response should have statuscode 201', async() => {
					mockUserRepository.registerUser.mockResolvedValue({id: 1})
					const response = await request(app).post(route).send(data)
					expect(response.statusCode).toBe(201)

				})

				it('Response should have a auth token', async() => {
					const response = await request(app).post(route).send(data)
					expect(response.body.hasOwnProperty('token')).toBeTruthy()
				})
			}

		})

		describe('Sending an empty body should return StatusCode 400', () => {
			const data = {}

			it('Response should be in application/json', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.type).toBe('application/json')
			})
			it('Response should have statuscode 400', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.statusCode).toBe(400)
			})
			it('Response should not have a auth token', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.body.hasOwnProperty('token')).toBeFalsy()
			})
		})
		
		describe('Registering with the same crdentials twice should return 500', () => {
			// registerUser returns false if a user already exists
			it('Response should have statuscode 500', async() =>{
			mockUserRepository.registerUser.mockResolvedValue(false)
				const response = await request(app).post(route).send({
					username: "R.User",
					password: "1234",
					email: "test@aspecialemail.com",
					firstName: "test",
					lastName: "user"
					})
				expect(response.statusCode).toBe(500)
			})
		})
	})

	describe('POST /user/login --> logging a user in', () => {
		const route = '/user/login'
		describe('Logging in with valid credentials', () => {
			//Assuming that the credentials are valid

			beforeEach(() => {
				mockUserRepository.loginUser.mockReturnValueOnce({id: 1})
			})

			const data = {
				username: "testuser",
				password: "1234"
			}

			it('response should be in application/json', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('response should have statuscode 200', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.status).toBe(200)
			})

			it('Response should have a auth token', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.body.hasOwnProperty('token')).toBeTruthy()
			})
		})

		describe('Logging in with invalid credentials', () => {
			const data = {
				username: "testuser",
				password: "wrongpassword"
			}
			
			it('response should be in application/json', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 401', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.status).toBe(401)
			})

		})

		describe('Logging in with malformed body', () => {
			const data = {
				username: "testuser",
				passworta: "wrongpassword"
			}

			it('response should be in application/json', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.type).toBe('application/json')
			})

			it('Response should have statuscode 401', async() => {
				const response = await request(app).post(route).send(data)
				expect(response.status).toBe(401)
			})
		})
	})
})
