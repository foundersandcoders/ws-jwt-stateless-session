const psst = require('./psst.js');
const { sign, validate } = psst('super string');

console.log(sign('Mario'));
console.log(
  validate(
    'Mario',
    '681529e301b1ab89aec92f597c005d72638ee0d0bb19b1e3cbadd8a9febc45ef'
  )
);
