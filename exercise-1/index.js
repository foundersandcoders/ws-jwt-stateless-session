const psst = require('./psst.js');
const {
  sign,
  validate
} = psst('super string');

console.log(sign('Mario'));
console.log(validate('Mario','aBUp4wGxq4muyS9ZfABdcmOO4NC7GbHjy63Yqf68Re8='));
