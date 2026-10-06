const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  res.status(201).json(await authService.register(req.body));
};

exports.login = async (req, res) => {
  res.status(200).json(await authService.login(req.body));
};
