'use strict';

module.exports = (secret) => {
  if (!secret || typeof secret !== 'string') {
    throw Error('invalid secret!');
  }

  const functions = {
    sign: (value) => {
      return crypto.createHmac('sha256', secret).update(value).digest('hex');
    },
    validate: (value, hash) => {
      const correctHash = functions.sign(value);
      return correctHash === hash;
    }
  };

  return functions;
}
