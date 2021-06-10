const {makeApp} = require('./index.js')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const port =  process.env.EXPRESS_PORT || 6060

//Craete app with all endpoints

//used to create documentation server for the api endpoints
const options = {
    definition: {
	openapi: "3.0.1",
	info: {
	    title: "TaskManager API",
	    description: `This page describes the API used for Taskmanager `,
	    version: "0.1.0"
	},
	servers: [
	    {
		url: "http://thisisgoingtogetfilled:6060"
	    }
	],
	components: {
	      securitySchemes: {
		bearerAuth: {
		  type: 'http',
		  scheme: 'bearer',
		  bearerFormat: 'JWT',
		}
	      }
	    },
	    security: [{
	      bearerAuth: []
	    }]
    },
    apis: [__dirname + "/routes/*.js"],
}

const app = makeApp()

const specs = swaggerJsDoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
app.listen(port, () => console.log(`Listening on: ${port}`))
