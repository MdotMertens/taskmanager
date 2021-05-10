const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

const port = process.env.EXPRESS_PORT || 6060

const userRouter = require('./routes/user')
const teamRouter = require('./routes/teams')

require('dotenv').config()

// Use bodyparser in order to parse requests into JSON
app.use(express.json({
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf)
        } catch(e){
            res.status(400).send('Invalid JSON')
        }
    },
    type: "*/*"
}))

// Set header for development purposes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next()
})

app.use('/user', userRouter)
app.use('/team', teamRouter)

app.get('/', (req,res) => {
    res.send({"name": "Test", "done": false})
})

app.listen(port, () => console.log(`Listening on: ${port}`))

