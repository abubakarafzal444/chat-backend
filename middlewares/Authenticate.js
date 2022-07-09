//This middleware is used to authenticate if jwt token
// is attached with request. If it is there it is decoded.

require("dotenv").config();

const jwt = require("jsonwebtoken");
const customError = require("../util/customError");
const Authenticate = (req, res, next) => {
  const token = req.get("Authorization")?.split(" ")[1];

  if (!token) {
    throw new customError(
      "Authentication failed. Please login to access this resource",
      401
    );
    // const jsonObj = JSON.stringify({
    //   status: 401,
    //   message: "Authentication failed. Please login to access this resource",
    // });
    // throw new Error(jsonObj);
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_DECODE_STRING);

    if (!decodedToken)
      throw new customError(
        "Authentication failed. Please login to access this resource",
        401
      );
    req.userName = decodedToken.userName;
    req._id = decodedToken._id;
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = Authenticate;
