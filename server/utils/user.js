const validate = require('jsonschema').validate

const userSchema = {
    "type": "object",
      "properties": {
        "username": {
          "type": "string"
        },
        "password": {
          "type": "string",
        },
        "email": {
          "type": "string"
        },
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        }
      },
        "required": ["username", "password", "firstName", "lastName"]
}

const verifyUserJSON = (jsonData) => validate(jsonData, userSchema, {allowUnknownAttributes: false})
module.exports = verifyUserJSON 
