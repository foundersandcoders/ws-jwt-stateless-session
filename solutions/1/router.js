'use strict';

const { readFile } = require('fs');
const { parse } = require('cookie');
const { sign, verify } = require('jsonwebtoken');

const SECRET = 'poiugyfguhijokpkoihugyfyguhijo';

const userDetails = { userId: 5, role: 'admin' };

const notFoundPage = '<p style="font-size: 10vh; text-align: center;">404!</p>';

module.exports = (req, res) => {
  switch (`${req.method} ${req.url}`) {
    case 'GET /':
      return readFile(
        './index.html',
        (err, data) => {
          res.writeHead(
            200,
            {
              'Content-Type': 'text/html',
              'Content-Length': data.length
            }
          );
          return res.end(data);
        }
      );
    case 'POST /login':
      const cookie = sign(userDetails, SECRET);
      res.writeHead(
        302,
        {
          'Location': '/',
          'Set-Cookie': `jwt=${cookie}; HttpOnly`
        }
      );
      return res.end();
    case 'POST /logout':
      res.writeHead(
        302,
        {
          'Location': '/',
          'Set-Cookie': 'jwt=0; Max-Age=0'
        }
      );
      return res.end();
    case 'GET /auth_check':
      const send401 = () => {
        const message = 'fail!';
        res.writeHead(
          401,
          {
            'Content-Type': 'text/plain',
            'Content-Length': message.length
          }
        );
        return res.end(message);
      }

      if (!req.headers.cookie) return send401();

      const { jwt } = parse(req.headers.cookie);

      if (!jwt) return send401();

      return verify(jwt, SECRET, (err, jwt) => {
        if (err) {
          return send401();
        } else {
          const message = `Your user id is: ${jwt.userId}`;
          res.writeHead(
            200,
            {
              'Content-Type': 'text/plain',
              'Content-Length': message.length
            }
          );
          return res.end(message);
        }
      });
    default:
      res.writeHead(
        404,
        {
          'Content-Type': 'text/html',
          'Content-Length': notFoundPage.length
        }
      );
      return res.end(notFoundPage);
  }
}
