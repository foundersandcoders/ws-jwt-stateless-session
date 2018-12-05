# Founders & Coders - JWT Stateless Session Workshop

__Learning Outcomes:__

- What is digital signing?
- What are JSON Web Tokens (JWTs)?
- how can we use JWTs with Node?

__Featured npm Packages:__
- [cookie](https://npmjs.com/package/cookie)
- [cookie-signature](https://npmjs.com/package/cookie-signature)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

## Contents

* [A more useful cookie](#a-more-useful-cookie)
* [Signing](#signing)
* [JSON Web Tokens](#json-web-tokens)
* [exercise 1: creating and validating JWT cookies](#exercise-1-creating-and-validating-jwt-cookies)
* [optional extra exercise 2- implement a HMAC](#optional-extra-exercise-2--implement-a-hmac)%

## A more useful cookie

A very simple cookie (key and value) could look like `logged_in=true` or `username=druscilla` but sometimes we want to store more, and better-structured data.

:star: How about JSON? :star

For example, inside a cookie, it might be useful to store:
1. a user's id, and
2. their access privileges.

We could write in our handler:
```js
const userInformation = {
  userId: 45,
  accessPrivileges: {
    user: true,
    admin: false
  }
};

const cookieValue = JSON.stringify(userInformation);

res.setHeader(
  'Set-Cookie',
  `data=${cookieValue}; HttpOnly; Secure`
);
```

Great! We now have a cookie that we can add as much information to as we need, but we still have the same **big security problem**: This cookie can be very easily tampered with. (For example, by opening up the DevTools 'Application' tab and setting `admin` to `true`)

So when our server reads a cookie from an incoming request, **how can we be sure that the cookie has not been edited?**

## Signing

We can use hashing (the same thing we used to protect our passwords in the password management [workshop](https://github.com/foundersandcoders/ws-password-management)), in order to know if our cookie has been altered.

However, we need to be sure only we can produce the correct hash. So if an attacker changes the cookie, they cannot produce the correct hash, and we will know the data has changed.

A [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) (Hash-based message authentication code) is a code which authenticates a message using a hash. In other words, it is exactly what we need!

A HMAC requires:
- a `secret`: a long random string which is private,
- a `value`: the message you want to sign, and
- a `mathematical algorithm` to create the hash.

You can store the HMAC alongside the original message to verify that the message/cookie/whatever has not been tampered with. This is known as **signing**.

**Metaphor Alert:** Think of the signature like a personal wax seal on a letter- the contents of the letter cannot be changed without breaking the seal, and the correct seal cannot be reproduced without the stamp!

**Note:** When protecting a cookie, defence against brute force attacks (e.g. hashing with `bcrypt`) is not necessary, for two reasons:
1. Just gaining access to a valid cookie will give you access to all of that users privileges, without any further work.
2. If you use a long enough string as a 'secret', with a modern hashing algorithm, there is not enough computing power on earth to crack it.

## JSON Web Tokens

This whole 'signed JSON' idea is such a good one that there is an entire open standard associated with it known as [JSON Web Tokens](https://jwt.io/).

JWT uses [base64](https://en.wikipedia.org/wiki/Base64) encoding which is a way of converting binary data into plain text. Encoding _is not_ the same as encrypting so **sensitive information should not be stored within a JWT**. We use JWTs for authentication and transferring data that you don't want to be tampered with.

**A JWT is just a string**, composed of three sections, joined together by full stops. The sections are:

**1. Header** - base64 encoded object about the type of token (jwt) and the type of hashing algorithm (ie HMAC SHA256).
```js
{
  alg: 'SHA256'
  type: 'JWT'
}
```
**2. Payload** - base64 encoded object with your 'claims' in it. Mostly just a fancy name for the data you want to store in your JWT, but it can also hold 'reserved claims', which are some useful standard values, such as `iss (issuer)`, `exp (expiration time)`, `sub (subject)`, and `aud (audience)`.
```js
{
  "name": "John Doe",
  "user": true,
  "admin": false
}
```
**3. Signature** - a hash of parts `1)` and `2)` joined by a full stop.
```js
hashFunction(`${encodedHeader}.${encodedPayload}`);
```

The overall structure of a JWT is:
> [header].[payload].[signature]

Here is an example of a JWT:
> eyJhbGciOiJIUzI1NiJ9.aGtqa2hr.IhQxjhZL2hMAR2MDKTD1hppR8KEO9cvEgsE_esJGHUA


So to build it in Node.js:
```js
const base64Encode = str =>
  Buffer.from(str).toString('base64');

const base64Decode = str =>
  Buffer.from(str, 'base64').toString();

// Usually two parts:
const header = {
  alg: 'SHA256', // The hashing algorithm to be used
  typ: 'JWT' // The token 'type'
};

// Your 'claims'
const payload = {
  userId: 99,
  username: 'ada'
};

const encodedHeader = base64Encode(JSON.stringify(header));
const encodedPayload = base64Encode(JSON.stringify(payload));

const signature = hashFunction(`${encodedHeader}.${encodedPayload}`);

// 'Udcna0ETPpRw5m3po3COjicb_cGJvgtnoLZyLnftaaI'

const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

// Result!
// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvayI6dHJ1ZSwiaWF0IjoxNTAxOTY2MjY5fQ.Udcna0ETPpRw5m3po3COjicb_cGJvgtnoLZyLnftaaI'

```

This JWT is protected from tampering, because it is signed. The payload and header are base64 encoded (to reduce the length), but they can easily be converted back to plain text- **their contents are not secret**. So **do not store sensitive user information in a JWT being sent as a cookie**, such as bank balance, DOB etc. To protect the information from being read, you would need to encrypt it, but in general, it is advised to never store sensitive data on a cookie.

---

## exercise 1: creating and validating JWT cookies

The full JWT spec is [rather large](https://tools.ietf.org/html/rfc7519), so as fun as it would be to implement it ourselves like above, lets go with a library.

We will be using [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken), to create our JWTs. I also recommend using [`cookie`](https://npmjs.com/package/cookie) to parse your incoming `req.headers.cookie` header.

Read the docs for both!

### Set up
+ `$ cd exercise-1`
+ `$ npm i`
+ `$ npm start`
+ Navigate to `localhost:3000`

### Task

You will see that `index.html` has three buttons, now you must implement the JWT cookie logic on the server side:

Endpoint | Action
---|---
`/login` | Should create a cookie using `jwt.sign`, attach it to the response, and redirect to `/`
`/logout` | Should remove the cookie and redirect to `/`
`/auth_check` | Should check if the cookie exists, validate it with `jwt.verify`, and send back a 200 or 401 response with an informative message!

## optional extra exercise 2- implement a HMAC

Now we are going to make an program for handling and verifying important communications.

Node.js has a built-in [HMAC function](https://nodejs.org/dist/latest-v8.x/docs/api/crypto.html#crypto_class_hmac).

You will be provided a Node.js module (to be used in your terminal), that accepts a 'secret' and returns an object with two functions on it, which you have to implement:
- sign: This function accepts a value (`String`), and uses the Node.js crypto module to create and return a HMAC `String` of that value using `SHA256` algorithm and `hex` encoder.
- validate: This function accepts a value (`String`), and a hash (`String`). It calculates the HMAC of the value and compares it to the hash that was provided. It should return a `Boolean`.

Here is an example of it in use:
```
const psst = require('./psst.js');

const { sign, validate } = psst('super secret string');

// Regular string
sign('winnie');
// 'f7f697686a57ed3308f7c536c8394ee55beb3540aab58340fba104a997b921ed'

// Or JSON string
sign('{"admin":true}');
// '97076541ba62ce457ef24935d67253227c6081a230150ac468ee9b8e132d2d01'

validate('woof', 'an incorrect signature'); // false
validate(
  'winnie', 'f7f697686a57ed3308f7c536c8394ee55beb3540aab58340fba104a997b921ed'
); // true
```

The file is in `./exercise-2/psst.js`.

To check your code, run `node ./exercise-2/index.js`. The correct response should be a hash and `true`.

__HINT:__ There is an [npm package](https://www.npmjs.com/package/cookie-signature) (that gets 11 million downloads a month) that uses HMACs to sign their cookies. You should be able to get plenty of help from reading its [source code](https://github.com/tj/node-cookie-signature). Look at how HMAC is being used. No copy pasting!
