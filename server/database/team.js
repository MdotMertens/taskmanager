const db = require('./index')

/**
 * Inserts a team into the database
 * @async
 * @param {string} teamName The name of the team
 * @param {string} teamManager The userId of the user who is the manager
 * @throws {TeamAlreadyExists} A team with teamName already exists
 * @throws {UserDoesNotExist} The user who wants to create the team does not exist
*/
async function createTeam(teamName, teamManager){
    try {
        await db.query({
            text: `INSERT INTO \"team_details\"(teamname, teammanager) VALUES($1, $2)`,
            values: [teamName, teamManager]
        })
    } catch(e){
        if(e.constraint.includes("teamname")) {
            throw new Error("Team with the given Name already exists")
                      .name("TeamAlreadyExists")
        } else if(e.constraint.includes("user")){
            throw {"status": "error", "message": "User does not exist"}
        }
    }
}

/**
 * Checks whether a user is the teamManager of the team with teamname
 * @param {string} userid
 * @param {string} teamname 
 * @returns true when userid is teamManager of teamname
 */
// Determines whether the user with uesrId is the teammanager 
// of team with teamname
async function isUserTeamManager(userid, teamname){
    let result
    try {
         result = await db.query({
                    text: `SELECT id, teammanager FROM \"team_details\" 
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
/**
 * Creates an invite which can be either accepted @link acceptTeamInvite
 * or declined @see declineTeamInvite
 * @param {integer} inviterId 
 * @param {string} username 
 * @param {string} teamname 
 * @returns true when the invite was successully created, false when it fails
 */
async function createTeamInvite(inviterId, username, teamname){
    const ksuid = await ksuid.random()
    try {
        await db.query({
            text: `INSERT INTO \"TeamInvites\"
                   (inviteid, inviteeid, inviterid, teamid)
                   VALUES($1,$2,
                       (SELECT id FROM \"User\" WHERE username=$3)
                       (SELECT id FROM \"TeamDetails\" WHERE teamname=$4),
                       )`,
            values: [ksuid, inviterId, username, teamname]
        })
    } catch(e){
        return null
    }
}

async function removeUserFromTeam(username, teamname) {
    try{
        db.query({
            text: `DELETE FROM \"Teams\"
             WHERE teamid=(SELECT id FROM \"TeamDetails\" WHERE teamname=$1)
             AND userid=(SELECT id FROM \"USER\" WHERE username=$2)`,
            values: [teamname, username]
        })
        return true
    } catch(e) {
        return false
    }
}

async function getInvites(userId){
    let result
    try {
        result = await db.query({
            text: `SELECT id u.username, td.teamname FROM \"TeamInvites\ AS ti"
                   INNER JOIN \"User\" AS u ON ti.inviterid = u.id
                   INNER JOIN \"TeamDetails\" AS td on td.id = ti.teamid
                   WHERE inviteeid = $1`,
            values: [userId]
        })
    } catch(e){
        return null
    }
    return result.rows[0]
}


/**
 * accepts the invite with the inviteId
 * @param {ksuid} inviteId 
 * @returns boolean
 */
async function acceptTeamInvite(inviteId){
    let result
    try {
        result = await db.query({
            text: `INSERT INTO \"TEAMS\"(teamid, userid)
                        VALUES(
                            (SELECT inviteeid, teamid FROM \"TeamInvites\"
                             WHERE inviteid=$1)
                        )
                   RETURNING (userid, teamid)`,
            values: [inviteId]
        })
    } catch(e){
       return false 
    }
    return [result.rows[0].userid, result.rows[0].teamid]
}

/**
 * deletes the invite with the inviteId
 * @param {ksuid} inviteId 
 * @returns boolean
 */
async function deleteTeamInvite(inviteId){
    try{
        await db.query({
            text: `DELETE FROM \"TeamInvites\"
                   WHERE inviteid=$1`,
            values: [inviteId]
        })
    } catch(e){
        return false
    }
    return true
}
module.exports = {
    createTeam,
    isUserTeamManager,
    createTeamInvite,
    removeUserFromTeam,
    getInvites,
    acceptTeamInvite,
    deleteTeamInvite
}
