# Week 7 - Session Management

__Learning Outcomes:__

- how to create a JSON cookie
- what is digital signing
- how to use signing to prevent data tampering
- what are JSON Web Tokens
- how to use JSON Web Tokens

__Featured npm Packages:__
- [cookie](https://npmjs.com/package/cookie)
- [cookie-signature](https://npmjs.com/package/cookie-signature)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

---

### A useful cookie

A very simple cookie (key and value) could look like `logged_in=true` or `username=druscilla` but these are not that useful for an application that requires any level of security.

There are two pieces of information about a user it is useful to store inside a cookie.
1. Their user id.
2. Their access privileges.

This will cover most of the requests that people will make to an application.

Therefore we should put them in our cookie. We could have something like `data=45&admin` and parse it ourselves but it's easier to just use a JavaScript object (which will also make it simpler to add new fields in future).

```
const userInformation = {
  userId: 45,
  accessPrivileges: {
    user: true,
    admin: false
  }
};

const cookieValue = JSON.stringify(userInformation);

req.setHeader('Set-Cookie', `data=${cookieValue}; HttpOnly; Secure`);
```

Great! We now have a cookie that we can add as much information to as we need, but there is still a big problem: This cookie can be very easily tampered with. (For example, by opening up the DevTools 'Application' tab and setting `admin` to `true`)

So when our server reads a cookie from an incoming request, how can we be sure that the cookie has not been edited?

### What is signing?

It is possible to use hashing (the same thing we used to protect our passwords in [Workshop 1](https://github.com/foundersandcoders/ws-password-management)), in order to protect our cookie from being altered.

In previous hashes we just had to compare the results, password to password. This is known as 'integrity' (ie, is the data the same). But for our cookie this isn't enough, we also need to verify the 'authentication' (ie, did we create the hash).

A [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) (Hash-based message authentication code) is a way to hash a message in order to verify its integrity and authentication. This is important as we need to be sure that:
1. We created the hash.
2. The message has not changed.

A HMAC requires a `secret` (random string), a `value` (the string you want to protect) and `mathematical algorithm` to apply to them.

These same three inputs will always produce the _same result_. So you can store the HMAC alongside the original message to verify in future, that the message/cookie/whatever has not been tampered with. This is known as 'signing'.

Luckily Node.js has a built-in [HMAC function](https://nodejs.org/dist/latest-v8.x/docs/api/crypto.html#crypto_class_hmac).

Note: When protecting a cookie, defence against brute force attacks (such as `bcrypt`) is not necessary, for two reasons:
1. Just gaining access to a valid cookie will give you access to all of that users privileges, without any further work.
2. If you use a long, random string as a 'secret', with a modern hashing algorithm, there is not enough computing power on earth to crack that.

---

### EXERCISE 1: PSST

Now we are going to make an program for handling and verifying important communications.

You will be provided a Node.js module (to be used in your terminal), that accepts a 'secret' and returns an object with two functions on it, which you have to implement:
- sign: This function accepts a value (`String`), and uses the Node.js crypto module to create and return a HMAC `String` of that value.
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

validate('woof', 'ijveorjgoerovoenboenbon'); // true or false
```

The file is in `./exercise-1/psst.js`.

__HINT:__ There is an [npm package](https://www.npmjs.com/package/cookie-signature) (that gets 11 million downloads a month) that uses HMACs to sign their cookies. You should be able to get plenty of help from reading its [source code](https://github.com/tj/node-cookie-signature). Look at how HMAC is being used. No copy pasting!

When you are done you can test it out by sharing a secret between two of you, and begin verifying messages from each other!

---

Whew! So now we know how to:

1. Store plenty of information on our cookie.
2. Prevent it from being tampered with.

We're done, right? One more thing...

### JSON Web Tokens

This whole 'signed JSON' idea is such a good one that there is an entire open standard associated with it known as [JSON Web Tokens](https://jwt.io/).

The stucture of a JWT is a string, composed of three sections, joined together by full stops. The sections are:

1. A base64 encoded header object (unrelated to http headers).
2. A base64 encoded payload object. This is an object with your 'claims' in it. Mostly just a fancy name for the data you want to store in your JWT, but it can also hold 'reserved claims', which are some useful standard values, such as `iss (issuer)`, `exp (expiration time)`, `sub (subject)`, and `aud (audience)`.
3. A hash of parts `1)` and `2)`,  joined together by a full stop. This is the signature.

So to build it in Node.js:
```
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

This JWT is protected from tampering, because it is signed, but the payload and header are base64 encoded, which is basically plaintext (its easy to convert back and forth). So do not store sensitive user information in a signed cookie, such as bank balance, DOB etc. To protect the information from being read, you will need to encrypt it, but this is rarely necessary. Another concern is that asymmetric 

---

### EXERCISE 2: SUPER COOKIE

The full JWT spec is [rather large](https://tools.ietf.org/html/rfc7519), so as fun as it would be to implement it ourselves like above, lets go with a library.

We will be using [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken), to create our JWTs. I also recommend using [`cookie`](https://npmjs.com/package/cookie) to parse your incoming `req.headers.cookie` header.

Read the docs for both!

#### Set up
+ `$ cd exercise-2`
+ `$ npm i`
+ `$ npm start`
+ Navigate to `localhost:3000`

#### Todo

You will see that `index.html` has three buttons, now you must implement the JWT cookie logic on the server side:

Endpoint | Action
---|---
`/login` | Should create a cookie using `jwt.sign`, attach it to the response, and redirect to `/`
`/logout` | Should remove the cookie and redirect to `/`
`/auth_check` | Should check if the cookie exists, validate it with `jwt.verify`, and send back a 200 or 401 response with an informative message!

---

### Resources
- [JWT Intro Video](https://jwt.io/introduction/)
