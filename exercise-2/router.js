'use strict';

const { readFile } = require('fs');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const notFoundPage = '<p style="font-size: 10vh; text-align: center;">404!</p>';

module.exports = (req, res) => {
  // simple request log
  console.log(`${req.method} ${req.url}`)

  switch (`${req.method} ${req.url}`) {

    case 'GET /': {
      return readFile('./index.html', (err, data) => {
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Content-Length': data.length
        });
        return res.end(data);
      });
    }

    // Add more cases here

    default: {
      res.writeHead(404, {
        'Content-Type': 'text/html',
        'Content-Length': notFoundPage.length
      });
      return res.end(notFoundPage);
    }
  }
}
