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

req.setHeader('Set-Cookie', `data=${cookieValue}; HttpOnly; Secure`);
```

Great! We now have a cookie that we can add as much information to as we need but there is a big problem: This cookie can be very easily tampered with. (For example, by opening up DevTools and setting `admin` to `true`)

So when our server reads a cookie from an incoming request, how can we be sure that the cookie has not been edited?

---

__EXERCISE 1:__ SIGNING A COOKIE

If you remember from [Workshop 1](https://github.com/foundersandcoders/ws-password-management), hashing requires a `secret` (random string), a `value` (the string you want to protect) and `mathematical algorithm` to apply to them.

This produces a random non-sensical result (the `signature`). But these same three inputs will always produce the _same signature_. So when you 'sign' a value you are store its hash alongside it so they can compared in future. This prevents the value from being tampered with.

Note: When protecting a cookie, defence against brute force attacks, such as bcyrpt, is not necessary, for two reasons:
1. Just gaining access to a valid cookie will give you access to all of that users privileges, without any further work.
2. If your application secret is a long random string, used with a powerful enough hash, there is not enough computer power on earth to crack that.

TODO:
1. Create a function that accepts a payload (string) and a secret (string). This function will return the original payload (the value), and the hashed payload (the signature), joined together by a full stop. For example:
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

__HINT:__ There is an [npm package](https://www.npmjs.com/package/cookie-signature) (that gets 11 million downloads a month) that does exactly this. You should be able to get plenty of help from reading its [source code](https://github.com/tj/node-cookie-signature). Look at how [HMAC](https://nodejs.org/dist/latest-v8.x/docs/api/crypto.html#crypto_class_hmac) (Hash Message Authentication Code) is being used. No copy pasting!

---

Whew! So now we know how to:

1. Store plenty of information on our cookie.
2. Prevent it from being tampered with.

We're done, right? One more thing.

__JSON WEB TOKENS__

This whole 'signed JSON' idea is such a good one that there is an entire open standard associated with it known as JSON Web Tokens ([intro video](https://jwt.io/introduction/)). The stucture of a JWT is a string, composed of the three sections, joined togther by full stops. The sections:
1. A base64 encoded header object (unrelated to http headers).
2. A base64 encoded payload object.
3. A hash of parts `1)` and `2)`  joined together by a full stop.

So it ends up coming together like:
```
const b64Encode = str =>
  Buffer.from(str).toString('base64');

const header = {
  // TODO
};

// Your 'claims'
const payload = {
  userId: 99,
  username: 'ada'
};

const encodedHeader = b64Encode(JSON.stringify(header));
const encodedPayload = b64Encode(JSON.stringify(payload));

const signature = hash(`${encodedHeader}.${encodedPayload}`, SUPER_SECRET);

// 'Udcna0ETPpRw5m3po3COjicb_cGJvgtnoLZyLnftaaI'

const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvayI6dHJ1ZSwiaWF0IjoxNTAxOTY2MjY5fQ.Udcna0ETPpRw5m3po3COjicb_cGJvgtnoLZyLnftaaI'

```

This JWT is protected from tampering, because it is signed, but the payload and header are base64 encoded, which is basically plaintext (its easy to convert back and forth). So do not store senstitive user information in a cookie, such as bank balance, DOB etc.

__TODO__
- more JWT info (eg headers, claims)
- a JWT exercise

## ENCRYPTION SCRAP - may be used

__EXERCISE 2:__ ENCRYPTION

Signing will protect a value from tampering. Encryption will protect against tampering and READING.

TO BE FINISHED
Revelevent links:
- http://lollyrock.com/articles/nodejs-encryption/
- http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/
- https://nodejs.org/api/crypto.html#crypto_crypto_createcipher_algorithm_password
- https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv

If you wish to encrypt your cookie you must follow the JWE standard.
