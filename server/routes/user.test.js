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
		it('Registering with correct body should return a token', async () => {
			mockUserRepository.registerUser.mockResolvedValue({id: 1})
			const response = await request(app).post(route).send({
				username: "R.User",
				password: "1234",
				email: "it@aspecialemail.com",
				firstName: "it",
				lastName: "user"
				})
			expect(response.type).toBe('application/json')
			expect(response.statusCode).toBe(201)
			expect(response.body.hasOwnProperty('token')).toBeTruthy()

		})

		it('Sending an empty body should return StatusCode 400', async () => {
			const response = await request(app).post(route).send({})
			expect(response.type).toBe('application/json')
			expect(response.statusCode).toBe(400)
			expect(response.body.hasOwnProperty('token')).toBeFalsy()
		})
		
		it('Registering with the same crdentials twice should return 500', async () => {

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

	describe('POST /user/login --> logging a user in', () => {
		const route = '/user/login'
		it('Logging in with valid credentials', async () => {
			mockUserRepository.loginUser.mockReturnValueOnce({id: 1})
			const response = await request(app).post(route).send({
				username: "testuser",
				password: "1234"
			})
			expect(response.status).toBe(200)
			expect(response.body.status).toBe("Success")
			expect(response.body.hasOwnProperty('token')).toBeTruthy()
		})

		it('Logging in with invalid credentials', async () => {
			const response = await request(app).post(route).send({
				username: "testuser",
				password: "wrongpassword"
			})
			expect(response.status).toBe(401)
			expect(response.body.status).toBe("Error")
		})

		it('Logging in with malformed body', async () => {
			const response = await request(app).post(route).send({
				username: "testuser",
				passworta: "wrongpassword"
			})
			expect(response.status).toBe(401)
			expect(response.body.status).toBe("Error")
		})
	})

	describe('GET /user/invites --> Getting Teaminvites for a user', () => {
	})
})
