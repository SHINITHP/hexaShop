const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const getUserId = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id; // Return the decoded userID
    } catch (err) {
        return null; // Return null if verification fails
    }
}

const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
const randomToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: MaxExpTime
  })
}

const getTotalValidTokenCount = (val) => {
  console.log(val,' : val')
  return val;
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: MaxExpTime
  })
}

const generateSimpleUniqueId = () => {
  const uniqueId = crypto.randomBytes(16).toString('base64'); // Generate a random unique ID
  return uniqueId;
}

const generatedNumbers = [];

function generateUniqueFourDigitNumber() {
    let number;
    do {
        number = Math.floor(Math.random() * 9000) + 1000; // Generate a random number between 1000 and 9999
    } while (generatedNumbers.includes(number)); // Check if the number has already been generated

    generatedNumbers.push(number); // Store the unique number
    return number;
}


module.exports = {
    getUserId,randomToken,getTotalValidTokenCount,generateSimpleUniqueId,generateUniqueFourDigitNumber
}