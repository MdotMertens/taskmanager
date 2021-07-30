const db = require('./index.js')

async function registerUser(userData){ 
    // Insert the user data into the database
    // if it throws an error, we return false
    let result
    try{
       result  = await db.query(
            `INSERT INTO \"User\"(username, password, email, firstname, lastname)
             VALUES($1,$2,$3,$4,$5) RETURNING id`
            ,[userData.username, userData.password, userData.email, userData.firstName, userData.lastName])
    } catch(e) {
        return false 
    }

    return result.rows[0]
}

async function loginUser(userData) {
    let result
    try {
        result = await db.query({
            text: `SELECT id, username, password FROM \"User\" WHERE username = $1`,
            values: [userData.username]})
    } catch(e){
        return false
    }
    if(result.rows[0].password === userData.password){
        return result.rows[0]
    }
    return false
}

/** 
    * Gets the username for a given userid
    * @async
    * @param (int) userId The userId to get the username for
    * @returns (string) username for the given userid*/
async function getUserNameById(userId){
    try{
        let result = await db.query({
            text: `SELECT username FROM \"User\"
                   WHERE id=$1`,
            values: userId
        })
        return result.rows[0].username
    } catch(e){
        console.log(e)
    }
}

/** 
    * Gets the username for a given userid
    * @async
    * @param (int) userId The userId to get the username for
    * @returns (string) username for the given userid*/
async function getIdByUsername(userId){
    try{
        let result = await db.query({
            text: `SELECT username FROM \"User\"
                   WHERE id=$1`,
            values: userId
        })
        return result.rows[0].username
    } catch(e){
        console.log(e)
    }
}


module.exports = {
    loginUser,
    registerUser,
    getUserNameById,
    getIdByUsername
}
