const mongoose = require('mongoose');

// Use a flexible schema to store openings data as-is from frontend
const openingsDataSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OpeningsData', openingsDataSchema);
