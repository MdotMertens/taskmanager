const Router = require('express-promise-router')
const router = new Router()

const { authRequest } = require('../utils/middleware')

const db = require('../database/index')

router.post('/create', authRequest, (req, res) => {
    const team = {
        teamName: req.body.teamName,
        teamManager: req.userId
    } 

    if(createTeam(team)){
        res.send('created team')
    } else res.send('error')

})

router.post('/:teamname/adduser')


async function createTeam(team){
    try {
        await db.query({
            text: `INSERT INTO \"TeamDetails\"(teamname, teammanager) VALUES($1, $2)`,
            values: [team.teamName, team.teamManager]
        })
    } catch(e){
        return false
    }
    return true
}

module.exports = router

