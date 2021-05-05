const Router = require('express-promise-router')
const router = new Router()

require('dotenv').config()

const jwt = require('jsonwebtoken')

const db = require('../database')

const validate = require('../utils/user')
const errorMessage = require('../utils/schemahelper')

router.get('/get', async(req,res) => {
    res.send('Hello from user')
})

// Route used to register a new user 
router.post('/register', async (req, res) => { 
    const data = req.body
    const validData = validate(data) //validate data against the excepted schema
    if(validData.valid){ // Check if the JSON is valid
        if (insertUserIntoDatabase(validData)){  // If we have a rowCount bigger than one, then the user registered successully
            //issue a token for the user to athenticate
            //tokens expoire after a day defined through expiresIn
            const jwtToken = jwt.sign({username: data.username }, process.env.JWT_SECRET, {expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24})
            res.json({message: 'Registered successfully', token: jwtToken})
        } else { // let the user know if we couldn't register him
            res.send(JSON.parse(`{"error": "Couldn't add user to database"}`))
        } 
    } else { //If not we let the user know what is wrong
        res.send(errorMessage(validData.errors))
    }
})

function insertUserIntoDatabase(userData){ 
    let insert
    // Insert the user data into the database
    // if it throws an error, we return null
    try{
        insert = await db.query(
            `INSERT INTO \"User\"(username, password, email, firstname, lastname)
             VALUES($1,$2,$3,$4,$5)`
            ,[userData.username, userData.password, userData.email, userData.firstName, userData.lastName])
    } catch(e) {
        return null 
    }

    return insert
}

module.exports = router
