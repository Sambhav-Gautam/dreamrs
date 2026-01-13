const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: { type: String, default: '' },
    workDescription: { type: String, default: '' },
    role: { type: String, default: '' },
    bio: { type: String, default: '' },
    email: { type: String, default: '' },
    image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    scholar: { type: String, default: '' },
    category: {
        type: String,
        required: true,
        index: true // Index for fast grouping
    },
    order: { type: Number, default: 0 } // For custom sorting if needed later
}, {
    timestamps: true
});

module.exports = mongoose.model('TeamMember', teamMemberSchema);
