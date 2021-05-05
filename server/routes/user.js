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
    const validData = validate(data)
    let insert
    if(validData.valid){ // Check if the JSON is valid
        try{
            insert = await db.query(
                `INSERT INTO \"User\"(username, password, email, firstname, lastname)
                 VALUES($1,$2,$3,$4,$5)`
                ,[data.username, data.password, data.email, data.firstName, data.lastName])
        } catch(e) {
            console.log(e)
            res.send('Error')
        }
        if (insert){  // If we have a rowCount bigger than one, then the user registered successully
            const jwtToken = jwt.sign({username: data.username }, process.env.JWT_SECRET, {expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24})
            res.json({message: 'Registered successfully', token: jwtToken})
        } 
    } else { //If not we let the user know what is wrong
        res.send(errorMessage(validData.errors))
    }
})

module.exports = router
