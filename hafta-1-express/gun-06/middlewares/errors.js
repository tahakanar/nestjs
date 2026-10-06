class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Bulunamadı') {
    super(404, message);
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Geçersiz istek') {
    super(400, message);
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Kimlik doğrulaması gerekli') {
    super(401, message);
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Çakışma') {
    super(409, message);
  }
}

module.exports = { HttpError, NotFoundError, BadRequestError, UnauthorizedError, ConflictError };
