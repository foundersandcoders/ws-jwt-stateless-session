'use strict';

module.exports = (secret) => {
  if (!secret || typeof secret !== 'string') {
    throw Error('invalid secret!');
  }

  const functions = {
    sign: (value) => {
      return 'oops';
    },
    validate: (value, hash) => {
      return false;
    }
  };

  return functions;
}
