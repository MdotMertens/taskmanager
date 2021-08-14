const Router = require('express-promise-router')
const router = new Router()

const checkTeam = require('../utils/teams')

const authRequest = require('../utils/middleware')

module.exports = (teamsRepository) => {
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
    *                           message:
    *                               type: string
    *                       example:
    *                           {"message": "Created team"}
    *           401:
    *               description: 
    *                   Returns an error
    *               content:
    *                   application/json:
    *                       properties:
    *                           message:
    *                               type: string
    *                   
    *                       example:
    *                        {"message": "ErrorMessage"}
    *
    *
    */
  router.post('/create', authRequest, async (req, res) => {
    if (!checkTeam.checkAddTeamSchema(req.body)) {
      res.status(400).json({ error: checkTeam.checkAddTeamSchema.errors })
    }

    await teamsRepository.createTeam(req.body.teamname, req.userId)

    res.status(201).json()

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
    *                           message:
    *                               type: string
    *                       example:
    *                           {"message": "Created invite for ${username}"}
    */
  router.post('/inviteuser', authRequest, async (req, res) => {
    const userId = req.userId
    const teamName = req.body.teamname
    const userName = req.body.username
    if (!await teamsRepository.isUserTeamManager(userId, teamName)) {
      res.status(401).json({
        "message": "You need to be the team lead to invite members"
      })
    }
    if (!await teamsRepository.createTeamInvite(userId, userName, teamName)) {
      res.status(500).json({
        "message": `Couldn't invite ${userName}`
      })
    }
    res.status(201).json({
      "message": `Invited ${userName} to ${teamName}`
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
  *                           message:
  *                               type: string
  *                       example:
  *                           {"message": "Created invite for ${username}"}
  */
  router.get('/invite/:inviteid/:acceptance', async (req, res) => {
    const inviteId = req.params.inviteid
    const acceptance = req.params.acceptance

    if (acceptance === "accept") {

      const [userId, teamId] = await teamsRepository.acceptTeamInvite(inviteId)

      if (!userId && !teamId) {
        res.status(400).json({
          message: `Invalid invite`
        })
      }

      teamsRepository.deleteTeamInvite(inviteId)
      res.status(200).json({
        message: `Added ${userId} to ${teamId}`
      })
    } else if (acceptance === "decline") {
      if (!await teamsRepository.deleteTeamInvite(inviteId)) {
        res.status(400).json({
          message: "Could not decline"
        })
      }
      res.status(200).json({
        message: "Declined invite"
      })
    } else {
      res.status(400).json({
        message: 'Accept or Decline Invite'
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
    *                           message:
    *                               type: string
    *                       example:
    *                           {"message": "Removed ${username} from {teamname}"}
    */
  router.delete('/removeuser', authRequest, async (req, res) => {
    //Check whether the user is the teammanager or the user itself

    const [isTeamManager, isToBeRemoved] = await Promise.all([
      teamsRepository.isUserTeamManager(req.userid, req.body.teamname),
      teamsRepository.getUserIdByName(req.username)
    ])

    if (!isTeamManager && isToBeRemoved !== req.id) {
      res.status(403).json({
        "message": "You need to be either the Teammanager or the user itself"
      })
    }

    const removal = await teamsRepository.removeUserFromTeam(req.body.username, req.body.teamname)

    if (!removal) {
      res.status(500).json({
        "message": "Could not delete user, try again"
      })
    }
    res.status(200).json()
  })

  return router
}
