const { Pool } = require('pg')

const env_file = (process.env.NODE_ENV !== "test") ? "/.env/dev" : "/.env/prod"  
require('dotenv').config({path: process.cwd() + env_file})

const pool = new Pool({ 
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PW,
    database: process.env.PG_DB
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}
