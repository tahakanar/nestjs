// Route: hangi URL + method hangi middleware'lerden geçip hangi controller'a gider
const { Router } = require('express');
const controller = require('../controllers/tasks.controller');
const { validateCreateTask, validateUpdateTask } = require('../middlewares/validate');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', validateCreateTask, controller.create);
router.patch('/:id', validateUpdateTask, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
