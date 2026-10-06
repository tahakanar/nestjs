const { BadRequestError } = require('./errors');

// Route'a özel middleware'ler: gövdeyi controller'a varmadan doğrular
function validateCreateTask(req, res, next) {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    throw new BadRequestError('title zorunlu ve boş olmayan bir string olmalı');
  }
  next();
}

function validateUpdateTask(req, res, next) {
  const { title, done } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    throw new BadRequestError('title boş olmayan bir string olmalı');
  }
  if (done !== undefined && typeof done !== 'boolean') {
    throw new BadRequestError('done boolean olmalı');
  }
  next();
}

function validateCredentials(req, res, next) {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestError('Geçerli bir email gerekli');
  }
  // bcrypt yalnızca ilk 72 byte'ı kullanır; üst sınır koymak mantıklı
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new BadRequestError('password 8-72 karakter arası bir string olmalı');
  }
  next();
}

module.exports = { validateCreateTask, validateUpdateTask, validateCredentials };
