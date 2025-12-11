const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authMiddleware} = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', adminController.loginAdmin);
router.post('/register', adminController.registerAdmin);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  });

router.get('/profile', authMiddleware, adminController.getAdminProfile);
router.put('/profile', authMiddleware, adminController.updateAdminProfile);
router.delete('/delete', authMiddleware, adminController.deleteAdmin);

module.exports = router;