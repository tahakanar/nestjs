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

module.exports = { validateCreateTask, validateUpdateTask };
