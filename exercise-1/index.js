const psst = require('./psst.js');
const { sign, validate } = psst('secret string');

console.log(sign('Mario'));
console.log(
  validate(
    'Mario',
    '5870327efaf0d940fd00345ae0d44f7d2e32988cfd41521c442e4a97ca363ee5'
  )
);
