const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, updateBookmark, deleteBookmark } = require('../controllers/bookmarkController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getBookmarks).post(addBookmark);
router.route('/:id').put(updateBookmark).delete(deleteBookmark);

module.exports = router;
