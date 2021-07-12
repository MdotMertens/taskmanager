const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const ajv = new Ajv.default()
addFormats(ajv)

const addToDoSchema = {
	type: "object",
	required: ["name", "date_created"],
	anyOf: [
		{
			required: ["assignee"]
		},
		{
			required: ["team_name"]
		}
	],
	properties: {
		name: {type: "string"},
		description: {type: "string"},
		date_created: {type: "string", format: "date-time"},
		date_finised: {type: "string", format: "date-time"},
		date_due: {type: "string", format: "date"},
		assignee: {type: "string"},
		team_name: {type: "string"}
	}
}

const checkAddToDoSchema = ajv.compile(addToDoSchema)

module.exports = {
	checkAddToDoSchema
}
