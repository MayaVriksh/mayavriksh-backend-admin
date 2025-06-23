const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = payload => {
    // console.log(payload);
    // console.log(JWT_SECRET);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = token => {
    try {
        // console.log(JWT_SECRET);
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.log("Token Verification Error: ", error);
    }
};

module.exports = { generateToken, verifyToken };
