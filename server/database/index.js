const { Pool } = require('pg')

require('dotenv').config()

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
