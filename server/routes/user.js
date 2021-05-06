const Router = require('express-promise-router')
const router = new Router()

require('dotenv').config()

const jwt = require('jsonwebtoken')

const db = require('../database')

const errorMessage = require('../utils/schemahelper')

const {checkRegisterJSON, checkLoginJSON} = require('../utils/user')

router.get('/get', async(req,res) => {
    res.send('Hello from user')
})

// Route used to register a new user 
router.post('/register', async (req, res) => { 
    const data = req.body
    const validData = checkRegisterJSON(data) //validate data against the excepted schema
    if(validData.valid){ // Check if the JSON is valid
        if (await registerUser(data)){  // If we have a rowCount bigger than one, then the user registered successully
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


router.post('/login', async(req, res) =>{
    const data = req.body
    const validData = checkLoginJSON(data)
    if(validData.valid){
        console.log(validData)
        if(await loginUser(data)){
            const jwtToken = jwt.sign({username: data.username }, process.env.JWT_SECRET, {expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24})
            res.json({message: 'Success', token: jwtToken})
        }
        res.send("Wrong pasword")
    } else res.send(errorMessage(validData.errors))
})

async function registerUser(userData){ 
    // Insert the user data into the database
    // if it throws an error, we return null
    try{
        await db.query(
            `INSERT INTO \"User\"(username, password, email, firstname, lastname)
             VALUES($1,$2,$3,$4,$5)`
            ,[userData.username, userData.password, userData.email, userData.firstName, userData.lastName])
    } catch(e) {
        return false 
    }

    return true
}

async function loginUser(userData) {
    let result
    try {
        result = await db.query({
            text: `SELECT username, password FROM \"User\" WHERE username = $1`,
            values: [userData.username]})
    } catch(e){
        return null
    }
    if(result.rows[0].password === userData.password){
        return true
    }
    return false
}

module.exports = router
