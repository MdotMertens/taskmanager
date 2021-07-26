const { makeApp } = require('../index.js')
const request = require('supertest')
const authRequest = require('../utils/middleware')
jest.mock('../utils/middleware',  () => jest.fn((req, res, next) => {
    req.id = 1
    next()
}))    

let app

const mockTeamsRepository = {
    createTeam: jest.fn(),
    getUserNameById: jest.fn(),
    getUserIdByName: jest.fn(),
    isUserTeamManager: jest.fn(),
    createTeamInvite: jest.fn(),
    acceptTeamInvite: jest.fn(),
    deleteTeamInvite: jest.fn(),
    removeUserFromTeam: jest.fn()
}

beforeAll(() =>{
	app = makeApp({teamRepository: mockTeamsRepository})
})

describe('Testing Team Router', () =>{
    describe('/team/create --> creating a team', ()=>{
        const route = '/team/create'
        describe('Creating a team with valid data', () => {
            let response
            beforeAll(async() => {
                const data = {
                    teamname: "AwesomeTeam"
                }
                response = await request(app).post(route).send(data)
            })
            it('Response should be in application/json', () => {
                expect(response.type).toBe('application/json')
            })
            it('StatusCode should be 201', () => {
                expect(response.statusCode).toBe(201)
            })
            it('Response should have a message in Body', () => {
                expect(response.body.message).toBeDefined()
            })
        })
        describe('Creating a team with malformed body', () =>{
            let response
            beforeAll(async() =>{
                const data = {
                    team: "AwesomeTeam"
                }
                response = await request(app).post(route).send(data)

            })
            it('Response should be in application/json', () => {
                expect(response.type).toBe('application/json')
            })
            it('Statuscode should be 400', () =>{
                expect(response.statusCode).toBe(400)
            })
        })
    })

    describe('/team/inviteuser', () => {
        const route = '/team/inviteuser'
        describe('TeamManager invites user', () => {
            let response
            beforeAll(async() => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(true)
                mockTeamsRepository.createTeamInvite.mockReturnValue(true)
                const data = {
                    teamname: "AwesomeTeam",
                    username: "AwesomeUser"
                }
                response = await request(app).post(route).send(data)
            })
            it('Response should be in application/json', () => {
                expect(response.type).toBe('application/json')
            })
            it('Statuscode should be 201', () => {
                expect(response.statusCode).toBe(201)
            })
            it('Response body should have a message', () => {
                expect(response.body.message).toBeDefined()
            })
        })
        describe('Non TeamManager invites user', () => {
            let response
            beforeAll(async() => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(false)
                const data = {
                    teamname: "AwesomeTeam",
                    username: "AwesomeUser"
                }
                response = await request(app).post(route).send(data)
            })
            it('Response should be in application/json', () => {
                expect(response.type).toBe('application/json')
            })
            it('StatusCode should be 401', () => {
               expect(response.statusCode).toBe(401) 
            })
            it('Response body should have a message', () => {
                expect(response.body.message).toBeDefined()
            })
        })

        describe('TeamManaeger invites non existing User', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(true)
                mockTeamsRepository.createTeamInvite.mockReturnValue(false)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).post(route).send(data)
            })      

            it('Response should be in application/json', () => {
                expect(response.type).toBe('application/json')
            })
            it('StatusCode should be 500', () => {
               expect(response.statusCode).toBe(500) 
            })
            it('Response body should have a message', () => {
                expect(response.body.message).toBeDefined()
            })
        })
    })

    describe('/team/invite/{inviteid}/{acceptance}', () => {
        describe('accepting a valid invite', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.acceptTeamInvite.mockReturnValue([1,2])
                const route = '/team/invite/123/accept' 
                response = await request(app).get(route).send()
            }) 
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('StatusCode should be 200', () => {
               expect(response.statusCode).toBe(200) 
            })
            it('Response should have a message', () => {
               expect(response.body.message).toBeDefined() 
            })
        })
        describe('declining a valid invite', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.deleteTeamInvite.mockReturnValue(true)
                const route = '/team/invite/123/decline' 
                response = await request(app).get(route).send()
            }) 
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('StatusCode should be 200', () => {
               expect(response.statusCode).toBe(200) 
            })
            it('Response should have a message', () => {
               expect(response.body.message).toBeDefined() 
            })
            
        })
        describe('accepting an invalid invite', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.acceptTeamInvite.mockReturnValue([false, false])
                const route = '/team/invite/123/accept' 
                response = await request(app).get(route).send()
            }) 
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('StatusCode should be 200', () => {
               expect(response.statusCode).toBe(400) 
            })
            it('Response should have a message', () => {
               expect(response.body.message).toBeDefined() 
            }) 
        })
        describe('declining an invalid invite', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.deleteTeamInvite.mockReturnValue(false)
                const route = '/team/invite/123/decline' 
                response = await request(app).get(route).send()
            }) 
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('StatusCode should be 200', () => {
               expect(response.statusCode).toBe(400) 
            })
            it('Response should have a message', () => {
               expect(response.body.message).toBeDefined() 
            }) 
            
        })
        describe('invalid option for acceptance', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.deleteTeamInvite.mockReturnValue(false)
                const route = '/team/invite/123/invalid' 
                response = await request(app).get(route).send()
            }) 
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('StatusCode should be 200', () => {
               expect(response.statusCode).toBe(400) 
            })
            it('Response should have a message', () => {
               expect(response.body.message).toBeDefined() 
            }) 
            
        })
    })

    describe('/team/removeuser --> removing a user from a team', () => {
        const route = '/team/removeuser'

        describe('removing a user as TeamManager',() => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(true)
                mockTeamsRepository.getUserIdByName.mockReturnValue(1)
                mockTeamsRepository.removeUserFromTeam.mockReturnValue(true)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).delete(route).send(data)
            })      

            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('Statuscode should be 200', () => {
               expect(response.statusCode).toBe(200) 
            })
        })
        describe('the user removes himself from the team', () => {
           let response 
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(false)
                mockTeamsRepository.getUserIdByName.mockReturnValue(1)
                mockTeamsRepository.removeUserFromTeam.mockReturnValue(true)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).delete(route).send(data)
            })      
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('Statuscode should be 200', () => {
               expect(response.statusCode).toBe(200) 
            })
        })

        describe('removing a user that is not in the team', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(true)
                mockTeamsRepository.removeUserFromTeam.mockReturnValue(false)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).delete(route).send(data)
            })       
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('Statuscode should be 500', () => {
               expect(response.statusCode).toBe(500) 
            })
        })

        describe('TeamManager from another team removes a user', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(false)
                mockTeamsRepository.getUserIdByName.mockReturnValue(2)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).delete(route).send(data)
            })       
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('Statuscode should be 403', () => {
               expect(response.statusCode).toBe(403) 
            })
        })

        describe('TeamManager removes a user that is not on the team', () => {
            let response
            beforeAll(async () => {
                mockTeamsRepository.isUserTeamManager.mockReturnValue(true)
                mockTeamsRepository.getUserNameById(2)
                mockTeamsRepository.removeUserFromTeam.mockReturnValue(false)
                const data = {
                   teamname: "AwesomeTeam",
                   username: "Not a user"
                }
                response = await request(app).delete(route).send(data)
            })          
            it('Response should be in application/json', () => {
               expect(response.type).toBe('application/json') 
            })
            it('Statuscode should be 500', () => {
               expect(response.statusCode).toBe(500) 
            })
        })
    } )
})
