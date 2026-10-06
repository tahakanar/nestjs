// Controller: req'ten veriyi alır, service'i çağırır, res ile cevap verir
const tasksService = require('../services/tasks.service');
const { BadRequestError } = require('../middlewares/errors');

const MAX_INT4 = 2147483647; // Postgres INTEGER üst sınırı

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > MAX_INT4) {
    throw new BadRequestError('id geçerli bir pozitif tam sayı olmalı');
  }
  return id;
}

function parseDoneQuery(value) {
  if (value === undefined) return undefined;
  if (value !== 'true' && value !== 'false') {
    throw new BadRequestError("done 'true' ya da 'false' olmalı");
  }
  return value === 'true';
}

// Express 5: async handler'daki hatalar otomatik error middleware'e gider
exports.list = async (req, res) => {
  res.status(200).json(await tasksService.findAll(req.user.id, parseDoneQuery(req.query.done)));
};

exports.get = async (req, res) => {
  res.status(200).json(await tasksService.findOne(req.user.id, parseId(req.params.id)));
};

exports.create = async (req, res) => {
  res.status(201).json(await tasksService.create(req.user.id, req.body));
};

exports.update = async (req, res) => {
  res.status(200).json(await tasksService.update(req.user.id, parseId(req.params.id), req.body));
};

exports.remove = async (req, res) => {
  await tasksService.remove(req.user.id, parseId(req.params.id));
  res.status(204).send();
};
