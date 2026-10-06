const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { validateCredentials } = require('../middlewares/validate');

const router = Router();

router.post('/register', validateCredentials, controller.register);
router.post('/login', validateCredentials, controller.login);

module.exports = router;
