const Router = require('express-promise-router')
const router = new Router()

const ksuid = require('ksuid')

const authRequest = require('../utils/middleware')

module.exports = (teamsRepository) =>{
/**
    * @swagger
    * /team/create:
    *   post:
    *       tags:
    *           - Team
    *       summary: Add a new team
    *       description: Creates a team with the name teamName
    *       requestBody:
    *           content:
    *               application/json:
    *                   schema:
    *                       type: object
    *                       properties:
    *                           teamname:
    *                               type: string
    *                           username:
    *                               type: string
    *                       required:
    *                           - teamname
    *                           - username
    *       responses:
    *           201:
    *               description: Returns a status and a message.
    *               content:
    *                   application/json:
    *                       properties:
    *                           status: 
    *                               type: string
    *                           message:
    *                               type: string
    *                       example:
    *                           {"status": "success", "message": "Created team"}
    *           401:
    *               description: 
    *                   Returns an error
    *               content:
    *                   application/json:
    *                       properties:
    *                           status: 
    *                               type: string
    *                           message:
    *                               type: string
    *                   
    *                       example:
    *                        {"status": "Error", "message": "ErrorMessage"}
    *
    *
    */
router.post('/create', authRequest, async (req, res) => {
    try{
        await teamsRepository.createTeam(req.body.teamname, req.userId)
    } catch(e){
        res.status(401).send(e)
    }

    if(!req.body.teamname){
        res.status(400).json({
            "status": "Error",
            "message": "Missing teamname"
        })
    }

    res.status(201).json({
        "status": "Success",
        "message":`Successfully created ${req.body.teamname}`
    })

})

/** 
    * @swagger
    * /team/createinvite:
    *   post:
    *       tags:
    *           - Team
    *       summary:
    *           Invites a user to a team
    *       description:
    *          Creates an invite for the user supplied with username to add them to add them to the team supplied with teamname. <br>
    *          Invites can only be created by the teamleader and last a week.
    *       requestBody:
    *           content:
    *               application/json:
    *                   schema:
    *                       type: object
    *                       properties:
    *                           teamname:
    *                               type: string
    *                           username:
    *                               type: string
    *                       required:
    *                           - teamname
    *                           - username
    *       responses:
    *           201:
    *               description: 
    *                   Test
    *               content:
    *                   application/json:
    *                       properties:
    *                           status:
    *                               type: string
    *                           message:
    *                               type: string
    *                       example:
    *                           {"status": "success", "message": "Created invite for ${username}"}
    */
router.post('/inviteuser', authRequest, async (req, res) =>  {
    const userId = req.userId
    const teamName = req.body.teamname
    const userName = req.body.username
    if(await teamsRepository.isUserTeamManager(userId, teamName)){
        if(await teamsRepository.createTeamInvite(userId, userName, teamName)){
            res.status(201).json({
                "status": "Success",
                "message": `Invited ${userName} to ${teamName}`
            })
        } else {
            res.status(500).json({
                "status": "Error",
                "message": `Couldn't invite ${userName}`
            })    
        }
    }
    res.status(401).json({
        "status": "Error",
        "message": "You need to be the team lead to invite members"
    })
})
	    /** @swagger
	    * /team/{inviteid}/{acceptance}:
	    *   post:
	    *       tags:
	    *           - Team
	    *       summary:
	    *           Act upon an invite
	    *       description:
	    *           Acts upon an invite with ksuid. Acceptance can either be accept or decline. <br>
	    *           Once an invite is accepted, the invited user belongs to the team.
	    *       requestBody:
	    *           content:
	    *               application/json:
	    *                   schema:
	    *                       type: object
	    *                       properties:
	    *                           teamname:
	    *                               type: string
	    *                           username:
	    *                               type: string
	    *                       required:
	    *                           - teamname
	    *                           - username
	    *       responses:
	    *           201:
	    *               description: 
	    *                   Test
	    *               content:
	    *                   application/json:
	    *                       properties:
	    *                           status:
	    *                               type: string
	    *                           message:
	    *                               type: string
	    *                       example:
	    *                           {"status": "success", "message": "Created invite for ${username}"}
	    */
	router.get('/invite/:inviteid/:acceptance', async(req, res) => {
	    const inviteId = req.params.inviteid
	    const acceptance = req.params.acceptance
	    if(acceptance === "accept"){
            const [userId, teamId] = await teamsRepository.acceptTeamInvite(inviteId)
            if(userId && teamId){
                res.status(200).json({
                status: "Success",
                message: `Added ${userId} to ${teamId}`
                })
                teamsRepository.deleteTeamInvite(inviteId)
            } else{
                res.status(400).json({
                    status: "Error",
                    message: `Invalid invite`
                })
            }
	    } else if(acceptance === "decline"){
            if ( await teamsRepository.deleteTeamInvite(inviteId) ){
                res.status(200).json({
                status: "Success",
                message: "Declined invite"
                })
            } else{
                res.status(400).json({
                    status: 'Error',
                    message: 'Invite does not exist'
                })
            }
	    } else {
		res.status(400).json({
		    status: "Error",
		    message: "Please accept or decline the invite"
		})
	    }
	})

/** 
    * @swagger
    * /team/removeuser:
    *   delete:
    *       tags:
    *           - Team
    *       summary:
    *           Removes a user from a team
    *       description:
    *           Removes a user from the team. You need to be either the teammanager or the user that is going to be removed
    *       requestBody:
    *           content:
    *               application/json:
    *                   schema:
    *                       type: object
    *                       properties:
    *                           teamname:
    *                               type: string
    *                           username:
    *                               type: string
    *                       required:
    *                           - teamname
    *                           - username
    *       responses:
    *           201:
    *               description: 
    *                   Successfully removed a user
    *               content:
    *                   application/json:
    *                       properties:
    *                           status:
    *                               type: string
    *                           message:
    *                               type: string
    *                       example:
    *                           {"status": "success", "message": "Removed ${username} from {teamname}"}
    */
router.delete('/removeuser', authRequest, async(req, res) => {
    //Check whether the user is the teammanager or the user itself
   
    const [isTeamManager, isToBeRemoved] = await Promise.all([
                                            teamsRepository.isUserTeamManager(req.userid, req.body.teamname),
                                            teamsRepository.getUserIdByName(req.username)])
    if ( isTeamManager || isToBeRemoved === req.id){
        const removal = await teamsRepository.removeUserFromTeam(req.body.username, req.body.teamname)
        if(removal){
            res.status(200).json({
                "status": "Success",
                "message": `It works`
            })
        } else {
            res.status(500).json({
                "status": "Error",
                "message": "Something went wrong, try again"
            })
        }
    } else{
        res.status(403).json({
            "status": "Error",
            "message": "nice"
        })
    }
})
    return router
}

