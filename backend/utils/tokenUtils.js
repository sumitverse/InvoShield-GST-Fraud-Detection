const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      gstin: user.gstin
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

module.exports = { generateToken };
