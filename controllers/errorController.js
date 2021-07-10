const AppError = require('../utils/AppError');

const handleJWTTokenExpError = () => new AppError('tokenExpired', 401);
const handleJWTError = () => new AppError('invalidAuth', 401);
const handleDBCastError = (er) => new AppError(`inputError`, 400);
const handleDBDuplicateError = () => new AppError(`duplication`, 400);

const handleValidationError = (er) => {
  const fields = Object.values(er.errors).map(el => el.message).join('; ');
  return new AppError(`validationError ${fields}`, 400);
};

const sendErrorForDev = (er, res) => {
  res.status(er.statusCode).json({
    message: er.message,
    name: er.name,
    error: er,
    stack: er.stack
  });
};

const sendErrorForProd = (er, res) => {
  if (er.isOperational) {
    res.status(er.statusCode).json({
      status: er.status,
      message: er.message
    });
  } else {
    res.status(er.statusCode).json({
      status: 'error',
      message: 'genericError'
    });
  }
};

module.exports = (er, req, res, next) => {
  er.status = er.status || 'error',
  er.statusCode = er.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    if (er.name === 'CastError') er = handleDBCastError(er);
    if (er.code === '11000') er = handleDBDuplicateError(er);
    if (er.name === 'ValidationError') er = handleValidationError(er);
    if (er.name === 'JsonWebTokenError') er = handleJWTError();
    if (er.name === 'TokenExpiredError') er = handleJWTTokenExpError();

    sendErrorForDev(er, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorForProd(er, res);
  }

  console.error(er);
};