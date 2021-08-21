module.exports = {
  openapi: "3.0.1",
  info: {
    title: "TaskManager API",
    description: `This page describes the API used for Taskmanager `,
    version: "0.1.0"
  },
  servers: [
    {
      url: "http://thisisgoingtogetfilled:6060"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
}
