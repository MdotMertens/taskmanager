const Ajv = require('ajv')
const ajv = new Ajv.default()


const addTeamSchema = {
	type: "object",
	required: ["teamname"],
	properties: {
		teamname: {type: "string"}
	},
	additionalProperties: false
}

const checkAddTeamSchema = ajv.compile(addTeamSchema)

module.exports = {
	checkAddTeamSchema
}
