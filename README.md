# Week 7 - Workshop 3 - Session Management

## !WORK IN PROGRESS!

__Learning Outcomes__

- what is cookie signing/encryption
- jwts or JSON cookies
- secure routing (maybe)

__npm packages__
- [cookie-signature](http://npmjs.com/package/cookie-signature)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

__Exercises__

- read docs for cookie/jwt/whatever and implement that as a middleware

---

### A useful cookie

A very simple cookie key and value would look like `logged_in=true` or `username=druscilla` but these are not that useful for and application that requires any level of security.

There are two pieces of information about a user it is useful to store inside a cookie.
1. Their user id.
2. Their access privileges.

These two pieces of information will cover most of the requests that people with make to an application.

Therefore we should put them in our cookie. Now we could have something like `data=45&admin` and parse it ourselves but it's easier to just use a JavaScript object (which will also make it easier to add new fields in future).

```
const userInformation = {
  userId: 45,
  accessPrivileges: {
    user: true,
    admin: false
  }
};

const cookieValue = JSON.stringify(userInformation);

req.setHeader('Set-Cookie', `data=${cookieValue}; HttpOnly; Secure; Max-Age=1916`);
```

Great! We now have a cookie that we can add as much information to as we need but there are 2 problems:

1. Everything in the cookie can be easily read.
2. This cookie can be very easily tampered with (ie, setting `admin` to `true`).

__EXERCISE 1:__ SIGNING

If you want to protect something from being tampered with but do not care if people can read the contents then you can sign it. Signing a value is very similar to the password hashing from [Workshop 1](https://github.com/foundersandcoders/ws-password-management). Now you will make your own signing function.

TODO:
1. Create a function that accepts a payload (string) and a secret (string). This will return the original payload, and the hashed payload, joined together by a full stop. For example:
```
// Regular string
sign('winnie', SUPER_SECRET);
// 'winnie.ueijgftgyhnecmvornv'

// Or JSON string
sign('{"admin":true}', SUPER_SECRET);
// '{"admin":true}.ijveorjgoerovoenboenbon'
```

2. Create a function that accepts the same cookie and breaks it in half at the full stop, hashes the part on the left (don't forget to use the same secret), and checks to see that both of the hashes are the same. This reveals whether the cookie value has been tampered with. The function should return a boolean.
```
validate('woof', SUPER_SECRET);
// false

validate('woof.miemowcnovnrov', SUPER_SECRET);
// true
```

__HINT:__ There is an [npm package](https://www.npmjs.com/package/cookie-signature) (that gets 11 million downloads a month) that does exactly this. You should be able to get plenty of help from reading its [source code](https://github.com/tj/node-cookie-signature). No copy pasting!

__EXERCISE 2:__ ENCRYPTION

Signing will protect a value from tampering. Encryption will protect against tampering and READING.

TO BE FINISHED
Revelevent links:
- http://lollyrock.com/articles/nodejs-encryption/
- http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/
- https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password
- https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv

---

Whew! So now we know how to:

1. Store plenty of information on our cookie.
2. Prevent it from being tampered with, or even read.

We're done, right? One more thing.

__JSON WEB TOKENS__

This whole signed/encrypted JSON idea is such a good one that there is an entire open standard associated with it known as JSON Wed Tokens. The stucture of a JWT consists of three sections.
1. A base64 encoded header object.
2. A base64 encoded payload object.
3. A hash of the first two parts joined together by a full stop.

(Note: the term header here is completely unrelated to http headers.)

So it ends up coming together like:
```
const b64Encode = val =>
  Buffer.from(JSON.stringify(str)).toString('base64');

const header = {
  // TODO
};

const payload = {
  // TODO
};

const encodedHeader = b64Encode(header);
const encodedPayload = b64Encode(payload);

const signature = hash(`${encodedHeader}.${encodedPayload}`, SUPER_SECRET);

const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

```

This JWT is protected from tampering, because it is signed, but the payload and header are base64 encoded, which is basically plaintext. If you wish to encrypt your cookie you must follow the JWE standard.

__TODO__
- Way more about JWE and JWT
- a JWT exercise
- ???
- 
