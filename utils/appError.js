class AppError extends Error {
  constructor() {
    super();
  }
  create(message, statusCode, httpStatus) {
    this.message = message;
    this.statusCode = statusCode;
    this.httpStatus = httpStatus;
    return this;
  }
}

module.exports = new AppError();
