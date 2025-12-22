const mongoose = require('mongoose');

// Use a flexible schema to store research data as-is from frontend
const researchDataSchema = new mongoose.Schema({
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: { publications: [], collaborations: [] }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ResearchData', researchDataSchema);
