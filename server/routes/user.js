const Router = require('express-promise-router')
const router = new Router()

const jwt = require('jsonwebtoken')

const checkUser = require('../utils/user')
const authRequest = require('../utils/middleware')

const env_file = (process.env.NODE_ENV !== "test") ? "/.env/dev" : "/.env/prod"
require('dotenv').config({ path: process.cwd() + env_file })

module.exports = (userRepository, teamRepository) => {
  // Route used to register a new user 
  /**
      * @swagger
      * /user/register:
      *   post:
      *       tags:
      *           - User
      *       summary: Creates a new user
      *       description: Creates a new user with the provided data
      *       requestBody:
      *           content:
      *               application/json:
      *                   schema:
      *                       type: object
      *                       properties:
      *                           username:
      *                               type: string
      *                           password:
      *                               type: string
      *                           email:
      *                               type: string
      *                           first_name:
      *                               type: string
      *                           last_name:
      *                               type: string
      *
      *       responses:
      *           201:
      *               description: 
    *                   Returns a JSON Object with a message and the jwt Token used to authorize further requests for the user
      *               content:
      *                   application/json:
      *                       properties:
      *                           message:
      *                               type: string
      *                           token:
      *                               type: string
      *                       example:
      *                           {"message": "Registered Succsefully", jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXNzYWdlIjoiUGVwc2kgaXMgYmV0dGVyIHRoYW4gQ29jYS1Db2xhIiwiaWF0IjoxNTE2MjM5MDIyfQ.fSVVXeplgroL8ojfOGslH1UOiM_y_wZTKeORiWb8I18"}
      *           500:
      *               description: 
    *                   Cannot register user.
      *               content:
      *                   application/json:
      *                       properties:
      *                           message:
      *                               type: string
      *                   
      *                       example:
      *                        {"message": "ErrorMessage"}
      *
      *
      */
  router.post('/register', async (req, res) => {
    if (!checkUser.checkRegisterJSON(req.body)) { // Check if the JSON is valid
      res.status(400).json(checkUser.checkRegisterJSON.errors)
    }

    const result = await userRepository.registerUser(req.body) //
    if (!result) {
      res.status(500).json({ message: "Couldn't add user to database" })
    }

    res.status(201).json({ token: createJWTToken(req.body.username, result.id) })
  })


  router.post('/login', async (req, res) => {
    if (!checkUser.checkLoginJSON(req.body)) {
      res.status(401).json({ message: checkUser.checkLoginJSON.errors })
    }

    const login = await userRepository.loginUser(req.body)
    if (login?.password !== req.body.password) {
      res.status(401).json({ message: "Username or password is wrong" })

    }

    res.status(200).json({ token: createJWTToken(req.body.username, login.id) })
  })

  const createJWTToken = (username, userId) => {

    const jwtPayload = {
      username: username,
      userId: userId
    }

    const jwtOptions = {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }

    return jwt.sign(jwtPayload, process.env.JWT_SECRET, jwtOptions)

  }

  /**  @swagger
  * /user/invites:
  *   get:
  *       tags:
  *           - User
  *       summary:
  *           List invites for user
  *       description:
  *           Returns a list of invites that the user is invited to. <br>
  *           The invite holds the ksuid for the invite, the inviters name and the teamname that the user is invited to.
  *       responses:
  *           200:
  *               description:
  *                   A list of invites for the user
  *               content:
  *                   application/json:
  *                       properties:
  *                           inviteid:
  *                               type: ksuid
  *                           inviter:
  *                               type: string
  *                           teamname:
  *                               type: string
  *                       example:
  *                           {
  *                           invites: [
  *                                   {"id": "1t5QCUCG9dyqo2dzibdkFzS9xch", "inviter": "SomeUser", "teamname": "SomeTeam"},
  *                                   {"id": "1t5QYSHE3RLrMjoF5ip3Oy7SFqh", "inviter": "SomeOtherUser", "teamname": "SomeOtherTeam"},
  *                               ]
  *                           } 
  *           204:
  *               description:
  *                   No invites are available for the user
  */
  router.get('/invites', authRequest, async (req, res) => {
    const invites = await teamRepository.getInvites(req.userId)
    if (!invites) {
      res.status(200).json(invites)
    }
    res.status(204).send()
  })

  return router
}
