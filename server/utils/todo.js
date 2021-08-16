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
		date_finished: {type: "string", format: "date-time"},
		date_due: {type: "string", format: "date"},
		assignee: {type: "string"},
		team_name: {type: "string"}
	},
	additionalProperties: false
}

const updateToDoSchema = {
	type: "object",
	properties: {
		id: {type: "string"},
		name: {type: "string"},
		description: {type: "string"},
		date_created: {type: "string", format: "date-time"},
		date_finished: {type: "string", format: "date-time"},
		date_due: {type: "string", format: "date"},
		assignee: {type: "string"},
		team_name: {type: "string"}
	},
	additionalProperties: false
}

const checkAddToDoSchema = ajv.compile(addToDoSchema)
const checkUpdateToDoSchema = ajv.compile(updateToDoSchema)

module.exports = {
	checkAddToDoSchema,
	checkUpdateToDoSchema
}
