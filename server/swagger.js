const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./swagger.json')

const port =  process.env.EXPRESS_PORT || 6060

const app = express()

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.listen(port, () => console.log(`Listening on: ${port}`))
