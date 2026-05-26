const Bookmark = require('../models/Bookmark');

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, bookmarks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.addBookmark = async (req, res) => {
    try {
        const { title, url, category, notes, isFavorite } = req.body;
        if (!title || !url) return res.status(400).json({ success: false, message: 'Title and URL components mandatory.' });

        const newBookmark = await Bookmark.create({
            userId: req.user.id, title, url, category, notes, isFavorite
        });
        res.status(201).json({ success: true, bookmark: newBookmark });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateBookmark = async (req, res) => {
    try {
        const { title, url, category, notes, isFavorite } = req.body;
        let bookmark = await Bookmark.findById(req.params.id);

        if (!bookmark) return res.status(404).json({ success: false, message: 'Resource element missing.' });
        if (bookmark.userId.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Unauthorized modification attempt.' });

        bookmark = await Bookmark.findByIdAndUpdate(
            req.params.id,
            { $set: { title, url, category, notes, isFavorite } },
            { new: true }
        );
        res.json({ success: true, bookmark });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findById(req.params.id);
        if (!bookmark) return res.status(404).json({ success: false, message: 'Resource element missing.' });
        if (bookmark.userId.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Unauthorized deletion attempt.' });

        await bookmark.deleteOne();
        res.json({ success: true, message: 'Bookmark resource deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
