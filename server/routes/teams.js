const Router = require('express-promise-router')
const router = new Router()

const { createHash } = require('crypto')

const { authRequest } = require('../utils/middleware')

const db = require('../database/index')

router.post('/create', authRequest, async (req, res) => {
    if(await createTeam(req.body.teamname, req.userId)){
        res.json({
            "status": "success",
            "message":`Successfully created ${req.body.teamname}`
        })
    } else res.send('error')

})

router.post('/:teamname/adduser', authRequest, async (req, res) =>  {
    if(await isUserTeamManager(req.userId, req.params.teamname)){
        console.log(await addUserToTeam(req.body.username, req.params.teamname))
    }
    res.send("You not the one")
})


async function createTeam(teamName, teamManager){
    try {
        await db.query({
            text: `INSERT INTO \"TeamDetails\"(teamname, teammanager) VALUES($1, $2)`,
            values: [teamName, teamManager]
        })
    } catch(e){
        console.log(e)
    }
}
// Determines whether the user with uesrId is the teammanager 
// of team with teamname
async function isUserTeamManager(userid, teamname){
    let result
    try {
         result = await db.query({
                    text: `SELECT id, teammanager FROM \"TeamDetails\" 
                           WHERE teamname=$1 AND teammanager=$2`,
                    values: [teamname,userid]
                })
    } catch(e) {
       console.log(e) 
    }

    if(result.rows[0].teammanager === userid){
        return true
    } return false
}

async function getUserId(username){
    let result 
    try {
        result = await db.query({
                        text: `SELECT id FROM \"User\"
                               WHERE username=$1`,
                        values: [username]
        })
    }
    catch(e){
            console.log(e)
        }
}

async function addUserToTeam(username, teamname){
    let teamId
    try{
        teamId = await db.query({
            text: `INSERT INTO \"Teams\"(teamid, userid)
                   VALUES(
                    (SELECT id FROM \"TeamDetails\" WHERE teamname=$1),
                    (SELECT id FROM \"User\" where username=$2)
                   )`,
            values: [teamname, username]
        })
    } 
    catch(e){
        console.log(e)
    }
}

async function createTeamInvite(userid, username, teamname){
    let hash = createHash('sha256')
    let inviteid = hash.update(username + teamname).digest('hex')
}

async function removeUserFromTeam(username, teamname) {
    let result
    try{
        result = db.query({
            text: `DELETE FROM \"Teams\"
             WHERE teamid=(SELECT id FROM \"TeamDetails\" WHERE teamname=$1)
             AND userid=(SELECT id FROM \"USER\" WHERE username=$2)`,
            values: [teamname, username]
        })
    } catch(e) {
        console.log(e)
    }
}


module.exports = router
