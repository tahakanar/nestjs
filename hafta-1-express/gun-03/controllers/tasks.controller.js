// Controller: req'ten veriyi alır, service'i çağırır, res ile cevap verir
const tasksService = require('../services/tasks.service');
const { BadRequestError } = require('../middlewares/errors');

function parseDoneQuery(value) {
  if (value === undefined) return undefined;
  if (value !== 'true' && value !== 'false') {
    throw new BadRequestError("done 'true' ya da 'false' olmalı");
  }
  return value === 'true';
}

exports.list = (req, res) => {
  res.status(200).json(tasksService.findAll(parseDoneQuery(req.query.done)));
};

exports.get = (req, res) => {
  res.status(200).json(tasksService.findOne(Number(req.params.id)));
};

exports.create = (req, res) => {
  res.status(201).json(tasksService.create(req.body));
};

exports.update = (req, res) => {
  res.status(200).json(tasksService.update(Number(req.params.id), req.body));
};

exports.remove = (req, res) => {
  tasksService.remove(Number(req.params.id));
  res.status(204).send();
};
