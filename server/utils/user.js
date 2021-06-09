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

const loginSchema = {
    "type": "object",
    "properties": { 
        "username": {
            "type": "string"
        },
        "password": {
            "type": "string"
        }
    },
    "required": ["username", "password"]
}

const checkRegisterJSON = (jsonData) => validate(jsonData, userSchema, {allowUnknownAttributes: false})
const checkLoginJSON = (jsonData) => validate(jsonData, loginSchema, {allowUnknownAttributes:false})



module.exports = {
    checkRegisterJSON,
    checkLoginJSON,
}
