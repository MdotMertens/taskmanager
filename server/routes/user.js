const Router = require('express-promise-router')
const router = new Router()

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
            res.send('Error')
        }
        if (insert){  // If we have a rowCount bigger than one, then the user registered successully
            res.send('Registered User')
        } 
    } else { //If not we let the user know what is wrong
        res.send(errorMessage(validData.errors))
    }
})

module.exports = router
