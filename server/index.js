const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

const db = require('./database/index')



const userRouter = require('./routes/user')

const makeApp =  ({userRepository = null, teamRepository = null}) => {
	

	if( process.env.NODE_ENV !== 'prod') {
		// Set header for development purposes
		app.use((_, res, next) => {
		    res.header("Access-Control-Allow-Origin", "*");
		    next()
		})
	}

	// Use bodyparser in order to parse requests into JSON
	app.use(express.json({
	    verify: (_, res, buf) => {
		try {
		    JSON.parse(buf)
		} catch(e){
		    res.status(400).send('Invalid JSON')
		}
	    },
	    type: "*/*"
	}))

	//Setting up routes for the app to use
	app.use('/user', userRouter(userRepository))
	app.use('/team', teamRouter(teamRepository))

	return app
}

module.exports = {
	app,
	makeApp
}
