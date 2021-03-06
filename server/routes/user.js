const Router = require('express-promise-router')
const router = new Router()

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const checkUser = require('../utils/user')
const authRequest = require('../utils/middleware')

const env_file = (process.env.NODE_ENV !== "test") ? "/.env/dev" : "/.env/prod"
require('dotenv').config({ path: process.cwd() + env_file })

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error("Could not hash password.")
  }
}

const checkPassword = async (password, hash) => {
  try {
    return bcrypt.compare(password, hash)
  }catch {
    throw new Error("Could not check password.")
  }
}

module.exports = (userRepository, teamRepository) => {
  // Route used to register a new user 
  router.post('/register', async (req, res) => {
    if (!checkUser.checkRegisterJSON(req.body)) { // Check if the JSON is valid
      res.status(400).json(checkUser.checkRegisterJSON.errors)
    }

    req.body.password = await hashPassword(req.body.password)
    const result = await userRepository.registerUser(req.body) //
    if (!result) {
      res.status(500).json({ message: "Couldn't add user to database" })
    }

    res.status(201).json({ token: createJWTToken(req.body.username, result.id) })
  })


  router.post('/login', async (req, res) => {
    if (!checkUser.checkLoginJSON(req.body)) {
      res.status(400).json({ message: checkUser.checkLoginJSON.errors })
    }

    const login = await userRepository.loginUser(req.body)
    if (!await checkPassword(req.body.password, login.password || !login)) {
      res.status(401).json({ message: "Username or password is wrong" })

    }

    res.status(200).json({ token: createJWTToken(req.body.username, login.id) })
  })

  router.get('/invites', authRequest, async (req, res) => {
    const invites = await teamRepository.getInvites(req.userId)
    if (!invites) {
      res.status(200).json(invites)
    }
    res.status(204).send()
  })

  const createJWTToken = (username, userId) => {
    const jwtPayload = {
      username: username,
      userId: userId
    }
    const jwtOptions = {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }
    return jwt.sign(jwtPayload, process.env.JWT_SECRET, jwtOptions)
  }


  return router
}
