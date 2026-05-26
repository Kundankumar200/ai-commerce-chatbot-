const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    category: { type: String, default: 'Uncategorized', trim: true },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
