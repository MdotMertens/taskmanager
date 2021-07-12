const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const ajv = new Ajv.default()
addFormats(ajv)

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


const checkRegisterJSON = ajv.compile(userSchema)
const checkLoginJSON = ajv.compile(loginSchema)


module.exports = {
    checkRegisterJSON,
    checkLoginJSON,
}
