const Router = require('express-promise-router')
const router = new Router()

const checkTeam = require('../utils/teams')

const authRequest = require('../utils/middleware')

module.exports = (teamsRepository) => {
  router.post('/create', authRequest, async (req, res) => {
    if (!checkTeam.checkAddTeamSchema(req.body)) {
      res.status(400).json({ error: checkTeam.checkAddTeamSchema.errors })
    }

    await teamsRepository.createTeam(req.body.teamname, req.userId)

    res.status(201).json()

  })

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

  router.get('/invite/:inviteid/:acceptance', async (req, res) => {
    const inviteId = req.params.inviteid
    const acceptance = req.params.acceptance

    if (acceptance === "accept") {

      const [userId, teamId] = await teamsRepository.acceptTeamInvite(inviteId)

      if (!userId && !teamId) {
        res.status(404).json({
          message: "Invalid invite"
        })
      }

      teamsRepository.deleteTeamInvite(inviteId)
      res.status(200).json({
        message: "Accepted Invite"
      })
    } else if (acceptance === "decline") {
      if (!await teamsRepository.deleteTeamInvite(inviteId)) {
        res.status(404).json({
          message: "Invalid invite"
        })
      }
      res.status(200).json({
        message: "Declined invite"
      })
    } else {
      res.status(400).json({
        message: "Accept or Decline Invite"
      })
    }
  })

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
