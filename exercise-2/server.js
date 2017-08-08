'use strict';

const http = require('http');

const router = require('./router.js');

const server = http.createServer();

const PORT = 3000;

server
.on(
  'listening',
  () =>
    console.log(`Server is listening on port: ${PORT}`)
)
.on('request', router);

server
.listen(PORT);
