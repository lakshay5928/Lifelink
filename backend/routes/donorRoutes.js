const router = require('express').Router();
const auth   = require('../middleware/auth');
const C      = require('../controllers/donorController');

router.get('/',             C.getAll);              // public
router.get('/search',       C.search);              // public
router.post('/emergency',   C.emergency);           // public
router.patch('/availability', auth, C.toggleAvailability); // protected
router.put('/me',           auth, C.updateMe);      // protected

module.exports = router;
