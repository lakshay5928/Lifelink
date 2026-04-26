const router = require('express').Router();
const auth   = require('../middleware/auth');
const admin  = require('../middleware/admin');
const C      = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(auth, admin);

router.get('/stats',          C.getStats);       // GET  /api/admin/stats
router.get('/donors',         C.getAllDonors);    // GET  /api/admin/donors
router.get('/donors/:id',     C.getDonor);        // GET  /api/admin/donors/:id
router.post('/donors',        C.createDonor);     // POST /api/admin/donors
router.put('/donors/:id',     C.updateDonor);     // PUT  /api/admin/donors/:id
router.delete('/donors/:id',  C.deleteDonor);     // DEL  /api/admin/donors/:id

module.exports = router;
