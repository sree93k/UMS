// const sessionSecret="mysecretsession"
// module.exports={sessionSecret}

const crypto = require('crypto');

// Generate a strong random session secret
const generateSessionSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sessionSecret = generateSessionSecret();
module.exports = { sessionSecret };