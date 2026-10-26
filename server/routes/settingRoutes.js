const express = require('express');
const router = express.Router();
const { fetchSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', fetchSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
