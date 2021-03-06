const jwt = require('jsonwebtoken')
// A function to authorize the requests in ordre to protect routes
// It uses JWT for authorization 
function authRequest(req, res, next) {
    const headerAuth = req.headers['authorization']
    const token = headerAuth && headerAuth.split(' ')[1]
    
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => { 
        // The JWT Token isn't valid
        // The resource is forbidden for the user
        if(err){
            res.sendStatus(403)
        }
        // Set the user in the request
        req.username = data.username
        req.userId = data.userId
        next()
    })
}


module.exports = authRequest
