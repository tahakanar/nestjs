const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./errors');

// Authorization: Bearer <token> başlığını doğrular, req.user'ı doldurur
function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Authorization: Bearer <token> başlığı gerekli');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: Number(payload.sub) };
  } catch {
    throw new UnauthorizedError('Token geçersiz ya da süresi dolmuş');
  }
  next();
}

module.exports = authMiddleware;
