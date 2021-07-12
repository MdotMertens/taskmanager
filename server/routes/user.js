const Router = require('express-promise-router')
const router = new Router()

const jwt = require('jsonwebtoken')

const errorMessage = require('../utils/schemahelper')

const {checkRegisterJSON, checkLoginJSON} = require('../utils/user')
const authRequest = require('../utils/middleware')

const env_file = (process.env.NODE_ENV !== "test") ? "/.env/dev" : "/.env/prod"  
require('dotenv').config({path: process.cwd() + env_file})

module.exports = (userRepository, teamRepository) => {
	// Route used to register a new user 
	router.post('/register', async (req, res) => { 
	    const data = req.body
	    const validData = checkRegisterJSON(data) //validate data against the excepted schema
	    if(validData){ // Check if the JSON is valid
		const result = await userRepository.registerUser(data) //
		if (result){  
		    //issue a token for the user to athenticate
		    //tokens expoire after a day defined through expiresIn
		    const jwtToken = jwt.sign({username: data.username, userId: result.id }, process.env.JWT_SECRET, {expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24})
		    res.status(201).json({status: "Success", message: 'Registered successfully', token: jwtToken})
		} else { // let the user know if we couldn't register him
		    res.status(500).json({status: "Error", error: "Couldn't add user to database"})
		} 
	    } else { //If not we let the user know what is wrong
		res.status(400).json(checkRegisterJSON.errors)
	    }
	})


	router.post('/login', async(req, res) =>{
	    const data = req.body
	    const validData = checkLoginJSON(data)
	    if(validData){
		const result = await userRepository.loginUser(data)
		if(result){
		    const jwtToken = jwt.sign({username: data.username, userId: result.id }, process.env.JWT_SECRET, {expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24})
		    res.status(200).json({status: 'Success', message: 'Logged in successfully', token: jwtToken})
		}
		res.status(401).json({status: 'Error', message: "Username or password is wrong"})
	    } else res.status(401).json({status: 'Error', message: checkLoginJSON.errors})
	})
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
	router.get('/invites', authRequest, async(req, res) => {
	    const invites = await teamRepository.getInvites(req.userId)
	    if(!invites){
		res.json(invites)
	    }
	    res.status(204).send()
	})

	return router
}
