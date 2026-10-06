const { NotFoundError } = require('./errors');

function notFoundHandler(req, res, next) {
  next(new NotFoundError('Adres bulunamadı'));
}

// Hata middleware'i 4 parametre alır: (err, req, res, next)
function errorHandler(err, req, res, next) {
  // HttpError ve body-parser hataları (bozuk JSON -> 400) status taşır
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({
    error: status >= 500 ? 'Sunucu hatası' : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
