import { UnauthorizedError } from "express-jwt";

const errorHandler = (err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      message: "Unauthorized: invalid or missing access token",
      details: err.message
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      message: "Unauthorized: invalid or missing access token",
      details: err.message
    });
  }

  next(err);
};

export default errorHandler;
